package main

import (
	"net"
	"os"
	"time"

	logrustash "github.com/bshuster-repo/logrus-logstash-hook"
	"github.com/sirupsen/logrus"
)

func main() {
	log := logrus.New()
	conn, err := net.Dial("tcp", ":8083")
	if err != nil {
		log.Fatal(err)
	}
	hook := logrustash.New(conn, logrustash.DefaultFormatter(logrus.Fields{"type": "default"}))
	log.Hooks.Add(hook)
	log.SetOutput(os.Stdout)
	// log.SetFormatter(&log.JSONFormatter{PrettyPrint: true})
	// log.SetLevel(log.TraceLevel)
	//log.SetReportCaller(true)
	log.Level = logrus.TraceLevel
	log.WithFields(logrus.Fields{
		"method": "main",
		"type":   "test",
	}).Debug("Test log")
	log.WithFields(logrus.Fields{
		"name": time.UnixMicro(time.Now().UTC().UnixNano() / 1e3),
	}).Info("Test log 2")
}
