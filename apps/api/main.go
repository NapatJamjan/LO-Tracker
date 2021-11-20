package main

import (
	"context"
	"log"
	"os"

	"lo-tracker/apps/api/auth"
	"lo-tracker/apps/api/db"
	"lo-tracker/apps/api/graph"
	"lo-tracker/apps/api/graph/generated"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
)

func init() {
	viper.SetConfigFile("../../.env")
	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}
	os.Setenv("DATABASE_URL", viper.GetString("DATABASE_URL"))
}

var (
	client *db.PrismaClient
	rdb    *redis.Client
)

func init() {
	client = db.NewClient()
	rdb = redis.NewClient(&redis.Options{
		Addr: viper.GetString("REDIS_URL"),
	})
}

func main() {
	if err := client.Prisma.Connect(); err != nil {
		panic(err)
	}
	defer func() {
		if err := client.Prisma.Disconnect(); err != nil {
			panic(err)
		}
	}()

	ctx := context.Background()
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		rdb = nil
		log.Println(err)
	}

	r := gin.Default()
	r.Use(cors.Default())
	r.GET("/", func() gin.HandlerFunc {
		return func(c *gin.Context) {
			playground.Handler("GraphQL playground", "/query").ServeHTTP(c.Writer, c.Request)
		}
	}())

	auth.SetAuthRouter(r.Group("/auth"), client, rdb, ctx)
	r.POST("/query" /**auth.GetMiddleware(rdb, ctx),*/, func(c *gin.Context) {
		handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{Client: client}})).ServeHTTP(c.Writer, c.Request)
	})
	r.Run(":8080")
}
