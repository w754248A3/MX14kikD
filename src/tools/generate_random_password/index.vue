<script setup lang="ts">
import { ref } from 'vue'


type FLAGS = "password" | "username" |"usernamelowchar"

function createPass(len: number, type: FLAGS) {

    function generatePassword(length: number, characters: string) {
        return Array.from(crypto.getRandomValues(new Uint32Array(length)))
            .map((x) => characters[x % characters.length])
            .join('');

    }

    function disorderChar(s:string):string{
        const char_vs = s.split("");


        return Array.from(crypto.getRandomValues(new Uint32Array(char_vs.length)))
        .map((v,i)=> ({key:v, val:char_vs[i]}))
        .sort((a,b)=> a.key-b.key)
        .map(v=> v.val)
        .join("");

    }

    function F检测生成的字符串中是否包含字符(v待检测字符串数组: string[], v被检测字符串: string) {

        const v被检测字符数组 = [...v被检测字符串];
        const res = v待检测字符串数组.map(v待检测字符串 => {
            let n = 0;

            [...v待检测字符串].forEach(v待检测字符 => {

                for (const iterator of v被检测字符数组) {
                    if (v待检测字符 === iterator) {
                        n += 1;
                        return;
                    }
                }

            });

            return n;
        }).filter(v => v >= 2).length === v待检测字符串数组.length;

        return res;

    }

    const specials = '!@#$%^&*()_+{}:"<>?\|[];\',./`~';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let vs: string[]
    if (type === "username") {
        vs = [lowercase, uppercase, numbers];



    }
    else if(type === "password")
    {
        vs = [specials, lowercase, uppercase, numbers];
    }
    else{
        

        vs = [lowercase, numbers];

    }
  

    const sum = disorderChar(vs.join(""));
    let n = 0;
    while (true) {

        const v = generatePassword(len, sum);

        if (F检测生成的字符串中是否包含字符(vs, v)) {
            console.log(n);
            return v;
        }
        else {
            n += 1;

            if (n > 1000) {
                throw new Error("生成失败");
            }
        }

    }

}


const usernameValue = ref<string>("");
const usernamelowcharValue = ref<string>("");

const passwordValue = ref<string>("");


const onclick = () => {

    passwordValue.value = createPass(16, "password");

    usernameValue.value = createPass(8, "username");

    usernamelowcharValue.value = createPass(8, "usernamelowchar");
};


</script>

<template>

    <div class="root">
   
    <div class="container">
        <div class="form-group">
            <label for="usernamelow">用户名(小写字母+数字):</label>
            <input type="text" name="usernamelow" :value="usernamelowcharValue">
        </div>
        <div class="form-group">
            <label for="username">用户名:</label>
            <input type="text" name="username" :value="usernameValue">
        </div>
        <div class="form-group">
            <label for="password">密码:</label>
            <input type="text" name="password" :value="passwordValue">
        </div>
        <div class="form-group">
            <button type="button" @click="onclick">生成</button>
        </div>
    </div>

         
    </div>

</template>

<style scoped>


.root{
font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}


.container {
    
    max-width: 600px;
    padding: 15px;

}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
}

.form-group button {
    padding: 10px 20px;
    background-color: #007BFF;
    color: white;
    border: none;
    cursor: pointer;
}

.form-group button:hover {
    background-color: #0056b3;
}
</style>
