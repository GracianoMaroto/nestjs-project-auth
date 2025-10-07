/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { accessibleBy } from '@casl/prisma';

@Injectable()
export class PostsService {
  
  constructor(
    private prismaService: PrismaService, 
    private abilityService: CaslAbilityService
  ){}

  create(createPostDto: CreatePostDto & { authorId: string }) {
    const ability = this.abilityService.ability;

    if(!ability.can('create', 'Post')){
      throw new UnauthorizedException('Unauthorized')
    }

    return this.prismaService.post.create({data: createPostDto,})
  }

  async findAll() {
    const ability = this.abilityService.ability;
    return this.prismaService.post.findMany({
      where: {
        AND: [accessibleBy(ability, 'read').Post],
      },
    });
  }

  findOne(id: string) {
    const ability = this.abilityService.ability;
    return this.prismaService.post.findUnique({
      where: { 
        id, 
        AND: [accessibleBy(ability, 'read').Post],
      },
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const ability = this.abilityService.ability;

    const post = await this.prismaService.post.findUnique({
      where: { 
        id, 
        AND: [accessibleBy(ability, 'update').Post],
      },
    });
    if(!post){
      throw new Error('Post not found')
    }
    return this.prismaService.post.update({
      where: { id },
      data: updatePostDto, //ver se tem password e aplicar o hash.
    })
  }

  remove(id: string) {
    return this.prismaService.post.delete({where: { id }})
  }
}
