<script setup lang="ts">
import { ref, computed } from 'vue'

const num1 = ref(0)
const num2 = ref(0)
const op = ref('+')

const result = computed(() => {
  const n1 = Number(num1.value)
  const n2 = Number(num2.value)
  
  switch (op.value) {
    case '+': return n1 + n2
    case '-': return n1 - n2
    case '*': return n1 * n2
    case '/': return n2 !== 0 ? n1 / n2 : 'Error: Div by 0'
    default: return 0
  }
})
</script>

<template>
  <div class="calculator">
    <div class="calc-row">
      <input type="number" v-model="num1" class="num-input" />
      
      <select v-model="op" class="op-select">
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">×</option>
        <option value="/">÷</option>
      </select>
      
      <input type="number" v-model="num2" class="num-input" />
      
      <span class="equals">=</span>
      
      <div class="result">{{ result }}</div>
    </div>
  </div>
</template>

<style scoped>
.calculator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  max-width: 600px;
  margin: 0 auto;
}

.calc-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
}

.num-input {
  padding: var(--spacing-md);
  font-size: var(--font-size-xl);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 120px;
  text-align: center;
}

.op-select {
  padding: var(--spacing-md);
  font-size: var(--font-size-xl);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  cursor: pointer;
}

.equals {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-text-light);
}

.result {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-xl);
  font-weight: bold;
  border-radius: var(--radius-md);
  min-width: 100px;
  text-align: center;
}
</style>
