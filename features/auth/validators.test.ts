import { describe, expect, it } from "vitest";
import { validateLogin, validateRegister } from "./validators";
describe("auth validators",()=>{
  it("принимает валидные данные обоих режимов",()=>{
    expect(validateRegister({email:"a@b.ru",password:"password1"})).toEqual({});
    expect(validateLogin({email:"a@b.ru",password:"password1"})).toEqual({});
  });
  it("отклоняет пустой вход",()=>expect(validateLogin({email:"",password:""})).toEqual({email:expect.any(String),password:expect.any(String)}));
  it("проверяет email при входе",()=>expect(validateLogin({email:"прежний-логин",password:"password1"})).toEqual({email:expect.any(String)}));
  it("проверяет границы регистрации",()=>expect(validateRegister({email:"bad",password:"123"})).toEqual({email:expect.any(String),password:expect.any(String)}));
});
