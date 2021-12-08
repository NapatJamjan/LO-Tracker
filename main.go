package main

import (
	//"net"
	"os"
	"time"

	//logrustash "github.com/bshuster-repo/logrus-logstash-hook"
	"github.com/sirupsen/logrus"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/spf13/viper"
)

func init() {
	viper.SetConfigFile("./.env")
	if err := viper.ReadInConfig(); err != nil {
		panic(err)
	}
	os.Setenv("DATABASE_URL", viper.GetString("DATABASE_URL"))
}

func generateAccessToken(userID string) string {
	accessUUID := uuid.New().String()
	accessToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{
		"authorized":  true,
		"access_uuid": accessUUID,
		"user_id":     userID,
		"exp":         0,
	}).SignedString([]byte(viper.GetString("ACCESS_SECRET")))
	return accessToken
}

func main() {
	log := logrus.New()
	// conn, err := net.Dial("tcp", ":8083")
	// if err != nil {
	// 	hook := logrustash.New(conn, logrustash.DefaultFormatter(logrus.Fields{"type": "default"}))
	// 	log.Hooks.Add(hook)
	// }
	log.SetOutput(os.Stdout)
	log.Level = logrus.TraceLevel
	log.WithFields(logrus.Fields{
		"method": "main",
		"type":   "test",
	}).Debug("Test log")
	log.WithFields(logrus.Fields{
		"name": time.UnixMicro(time.Now().UTC().UnixNano() / 1e3),
	}).Info("Test log 2")

	println(generateAccessToken("1000"))
}
