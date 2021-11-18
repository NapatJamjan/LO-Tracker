package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println(time.Now().UTC().UnixNano() / 1e6)
	fmt.Println(time.UnixMicro(time.Now().UTC().UnixNano() / 1e3))
}
