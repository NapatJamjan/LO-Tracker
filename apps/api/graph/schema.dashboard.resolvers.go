package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"lo-tracker/apps/api/db"
	"lo-tracker/apps/api/graph/model"
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
