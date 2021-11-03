package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"lo-tracker/apps/api/db"
	"lo-tracker/apps/api/graph/model"
	"strconv"
)

func (r *queryResolver) QuizResults(ctx context.Context, courseID string) ([]*model.DashboardResult, error) {
	allQuizzes, err := r.Client.Quiz.FindMany(
		db.Quiz.CourseID.Equals(courseID),
	).With(
		db.Quiz.Questions.Fetch().With(
			db.Question.Results.Fetch().With(
				db.QuestionResult.Student.Fetch().With(
					db.Student.User.Fetch(),
				),
			),
		),
	).Exec(ctx)
	if err != nil {
		return []*model.DashboardResult{}, err
	}
	response := []*model.DashboardResult{}
	for _, quiz := range allQuizzes {
		maxScore := 0
		studentScore := map[string]*model.DashboardResultSub{}
		for _, question := range quiz.Questions() {
			maxScore += question.MaxScore
			for _, result := range question.Results() {
				if _, added := studentScore[result.StudentID]; !added {
					studentScore[result.StudentID] = &model.DashboardResultSub{
						StudentID:    result.StudentID,
						StudentName:  result.Student().User().Name,
						StudentScore: 0,
					}
				}
				studentScore[result.StudentID].StudentScore += result.Score
			}
		}
		results := []*model.DashboardResultSub{}
		for _, result := range studentScore {
			results = append(results, result)
		}
		response = append(response, &model.DashboardResult{
			QuizName: quiz.Name,
			MaxScore: maxScore,
			Results:  results,
		})
	}
	return response, nil
}

func (r *queryResolver) PloSummary(ctx context.Context, courseID string) ([]*model.DashboardPLOSummary, error) {
	allRelatedLOs, err := r.Client.LO.FindMany(
		db.LO.CourseID.Equals(courseID),
	).With(
		db.LO.Links.Fetch().With(db.LOlink.Plo.Fetch()),
	).Exec(ctx)
	if err != nil {
		return []*model.DashboardPLOSummary{}, err
	}
	plos := map[string][]string{}
	for _, lo := range allRelatedLOs {
		for _, link := range lo.Links() {
			if _, added := plos[link.PloID]; !added {
				plos[link.PloID] = make([]string, 0)
			}
			plos[link.PloID] = append(plos[link.PloID], link.LoID)
		}
	}
	response := []*model.DashboardPLOSummary{}
	for ploID, los := range plos {
		response = append(response, &model.DashboardPLOSummary{
			PloID: ploID,
			LoID:  los,
		})
	}
	return response, nil
}

func (r *queryResolver) FlatSummary(ctx context.Context, courseID string) (*model.DashboardFlat, error) {
	students, err := r.StudentsInCourse(ctx, courseID)
	if err != nil {
		return &model.DashboardFlat{}, nil
	}
	allQuestions, err := r.Client.Question.FindMany(
		db.Question.Quiz.Where(
			db.Quiz.CourseID.Equals(courseID),
		),
	).With(
		db.Question.Links.Fetch().With(
			db.QuestionLink.LoLevel.Fetch().With(
				db.LOlevel.Lo.Fetch().With(
					db.LO.Links.Fetch().With(db.LOlink.Plo.Fetch()),
				),
			),
		),
		db.Question.Results.Fetch(),
	).Exec(ctx)
	if err != nil {
		return &model.DashboardFlat{}, nil
	}
	response := &model.DashboardFlat{
		Students:  students,
		Plos:      []*model.Plo{},
		Los:       []*model.Lo{},
		Questions: []*model.DashboardFlatQuestion{},
	}
	includedPLOsGlobal := map[string]bool{}
	includedLOsGlobal := map[string]*model.Lo{}
	for _, question := range allQuestions {
		results := []*model.DashboardFlatQuestionResult{}
		includedPLOsLocal := map[string]bool{}
		includedLOsLocal := map[string]bool{}
		for _, result := range question.Results() {
			results = append(results, &model.DashboardFlatQuestionResult{
				StudentID:    result.StudentID,
				StudentScore: result.Score,
			})
		}
		for _, lo := range question.Links() {
			for _, link := range lo.LoLevel().Lo().Links() {
				ploID := link.Plo().ID
				if _, addedLocal := includedPLOsLocal[ploID]; !addedLocal {
					includedPLOsLocal[link.Plo().ID] = true
					if _, addedGlobal := includedPLOsGlobal[ploID]; !addedGlobal {
						response.Plos = append(response.Plos, &model.Plo{
							ID:          link.PloID,
							Title:       link.Plo().Title,
							Description: link.Plo().Description,
							PloGroupID:  link.Plo().PloGroupID,
						})
					}
				}
			}
			loID := lo.LoLevel().LoID
			loLevel := strconv.Itoa(lo.LoLevel().Level)
			if _, addedLocal := includedLOsLocal[loID+","+loLevel]; !addedLocal {
				includedLOsLocal[loID+","+loLevel] = true
				if _, addedGlobal := includedLOsGlobal[loID]; !addedGlobal {
					includedLOsGlobal[loID] = &model.Lo{
						ID:     lo.LoLevel().LoID,
						Title:  lo.LoLevel().Lo().Title,
						Levels: []*model.LOLevel{{Level: lo.LoLevel().Level, Description: lo.LoLevel().Description}},
					}
				} else {
					found := false
					for _, loLevel := range includedLOsGlobal[loID].Levels {
						if loLevel.Level == lo.LoLevel().Level {
							found = true
							break
						}
					}
					if !found {
						temp := includedLOsGlobal[lo.LoLevel().LoID]
						temp.Levels = append(temp.Levels, &model.LOLevel{Level: lo.LoLevel().Level, Description: lo.LoLevel().Description})
						includedLOsGlobal[lo.LoLevel().LoID] = temp
					}
				}
			}
		}
		linkedPLOs := []string{}
		linkedLOs := []string{}
		for ploID := range includedPLOsLocal {
			linkedPLOs = append(linkedPLOs, ploID)
		}
		for loIDLevel := range includedLOsLocal {
			linkedLOs = append(linkedLOs, loIDLevel)
		}
		response.Questions = append(response.Questions, &model.DashboardFlatQuestion{
			Title:      question.Title,
			MaxScore:   question.MaxScore,
			LinkedPLOs: linkedPLOs,
			LinkedLOs:  linkedLOs,
			Results:    results,
		})
	}
	for _, lo := range includedLOsGlobal {
		response.Los = append(response.Los, lo)
	}
	return response, nil
}
