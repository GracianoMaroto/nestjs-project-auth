/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { LoginDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt'
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { packRules } from '@casl/ability/extra';

@Injectable()
export class AuthService {

    // o constructor insere todos os serviços que você usará na construção do novo serviço.
    constructor(
        private jwtService: JwtService, 
        private prismaService: PrismaService,
        private abilityService: CaslAbilityService
    ){}
    
    async login(loginDto: LoginDto){

        //verificando se o email inserido coincide com algum cadastrado.
        const user = await this.prismaService.user.findUnique({
            where: { email: loginDto.email },
        });

        // se não encontrar o email terá um erro de invalid credentials.
        if(!user){
            throw new Error('Invalid credentials')
        }

        const isPasswordValid = bcrypt.compareSync(  
        //comparando as duas senhas, a cadastrada x a inserida para verificar se são iguais.
            loginDto.password, //senha cadastrada no banco de dados.
            user.password     //senha inserida para autenticação.
        )

        // se as senhas não coincidirem terá um erro de invalid credentials.
        if(!isPasswordValid){ 
            throw new Error('Invalid credentials') 
        }

        // Puxando as regras de usuário para inserí-las no token.
        const ability = this.abilityService.createForUser(user)
        // Inserindo no token as informações pertinentes da criação do usuário.
        const token = this.jwtService.sign({
            name: user.name, 
            email: user.email, 
            role: user.role, 
            sub: user.id,
            permissions: packRules(ability.rules),
        });
        return { acess_token: token}
        // puxando de volta o token para uso.
    }
}
