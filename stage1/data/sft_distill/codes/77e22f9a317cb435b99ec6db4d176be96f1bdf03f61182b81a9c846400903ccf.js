class ParticleShowcaseScene extends Phaser.Scene {
  constructor() {
    super('ParticleShowcaseScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
    this.emitter = null;
    this.statusText = null;
  }

  preload() {
    // 创建20种不同颜色的粒子纹理
    const colors = [
      0xFF0000, // 红色
      0x00FF00, // 绿色
      0x0000FF, // 蓝色
      0xFFFF00, // 黄色
      0xFF00FF, // 洋红
      0x00FFFF, // 青色
      0xFF8000, // 橙色
      0x8000FF, // 紫色
      0xFF0080, // 粉红
      0x80FF00, // 黄绿
      0x0080FF, // 天蓝
      0xFF8080, // 浅红
      0x80FF80, // 浅绿
      0x8080FF, // 浅蓝
      0xFFFF80, // 浅黄
      0xFF80FF, // 浅洋红
      0x80FFFF, // 浅青
      0xFFFFFF, // 白色
      0x808080, // 灰色
      0x400040  // 深紫
    ];

    colors.forEach((color, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });

    // 定义20种不同的粒子效果配置
    this.particleConfigs = [
      // 0: 爆炸效果
      {
        texture: 'particle0',
        speed: { min: 100, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1000,
        frequency: 50,
        quantity: 5
      },
      // 1: 喷泉效果
      {
        texture: 'particle1',
        speed: { min: 50, max: 200 },
        angle: { min: -110, max: -70 },
        scale: { start: 0.8, end: 0.3 },
        alpha: { start: 1, end: 0.5 },
        lifespan: 2000,
        frequency: 20,
        gravityY: 300
      },
      // 2: 螺旋效果
      {
        texture: 'particle2',
        speed: 100,
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 1 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 1500,
        frequency: 30,
        rotate: { start: 0, end: 360 }
      },
      // 3: 烟雾效果
      {
        texture: 'particle3',
        speed: { min: 20, max: 80 },
        angle: { min: -100, max: -80 },
        scale: { start: 0.3, end: 1.5 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 3000,
        frequency: 100
      },
      // 4: 闪光效果
      {
        texture: 'particle4',
        speed: { min: 150, max: 250 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.2, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 500,
        frequency: 80,
        quantity: 3
      },
      // 5: 雨滴效果
      {
        texture: 'particle5',
        speed: { min: 200, max: 400 },
        angle: { min: 85, max: 95 },
        scale: { start: 0.4, end: 0.2 },
        alpha: { start: 1, end: 0.3 },
        lifespan: 1500,
        frequency: 10,
        gravityY: 500
      },
      // 6: 火焰效果
      {
        texture: 'particle6',
        speed: { min: 30, max: 100 },
        angle: { min: -110, max: -70 },
        scale: { start: 0.8, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 1200,
        frequency: 40,
        quantity: 2
      },
      // 7: 星星效果
      {
        texture: 'particle7',
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 1 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 60,
        rotate: { start: 0, end: 720 }
      },
      // 8: 波纹效果
      {
        texture: 'particle8',
        speed: { min: 80, max: 120 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.2, end: 1.5 },
        alpha: { start: 1, end: 0 },
        lifespan: 1800,
        frequency: 100,
        quantity: 1
      },
      // 9: 旋转效果
      {
        texture: 'particle9',
        speed: 150,
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0.3 },
        alpha: { start: 1, end: 0 },
        lifespan: 1500,
        frequency: 25,
        rotate: { start: 0, end: -360 }
      },
      // 10: 脉冲效果
      {
        texture: 'particle10',
        speed: { min: 50, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 1.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 1000,
        frequency: 150,
        quantity: 8
      },
      // 11: 飘雪效果
      {
        texture: 'particle11',
        speed: { min: 30, max: 80 },
        angle: { min: 70, max: 110 },
        scale: { start: 0.6, end: 0.3 },
        alpha: { start: 0.9, end: 0.2 },
        lifespan: 4000,
        frequency: 50,
        gravityY: 50
      },
      // 12: 电光效果
      {
        texture: 'particle12',
        speed: { min: 200, max: 400 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 400,
        frequency: 120,
        quantity: 4
      },
      // 13: 漂浮效果
      {
        texture: 'particle13',
        speed: { min: 20, max: 60 },
        angle: { min: -100, max: -80 },
        scale: { start: 0.5, end: 0.8 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 3500,
        frequency: 80,
        gravityY: -50
      },
      // 14: 爆裂效果
      {
        texture: 'particle14',
        speed: { min: 250, max: 400 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.2, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 600,
        frequency: 200,
        quantity: 10
      },
      // 15: 光环效果
      {
        texture: 'particle15',
        speed: { min: 100, max: 180 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.4, end: 1.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 1600,
        frequency: 40,
        rotate: { start: 0, end: 180 }
      },
      // 16: 涟漪效果
      {
        texture: 'particle16',
        speed: { min: 60, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 1.8 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 2200,
        frequency: 120,
        quantity: 2
      },
      // 17: 流星效果
      {
        texture: 'particle17',
        speed: { min: 300, max: 500 },
        angle: { min: 30, max: 60 },
        scale: { start: 0.8, end: 0.2 },
        alpha: { start: 1, end: 0 },
        lifespan: 1000,
        frequency: 200,
        gravityY: 200
      },
      // 18: 烟花效果
      {
        texture: 'particle18',
        speed: { min: 150, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0.1 },
        alpha: { start: 1, end: 0 },
        lifespan: 1400,
        frequency: 100,
        quantity: 6,
        gravityY: 100
      },
      // 19: 魔法效果
      {
        texture: 'particle19',
        speed: { min: 80, max: 160 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.7, end: 0.3 },
        alpha: { start: 1, end: 0 },
        lifespan: 1800,
        frequency: 50,
        rotate: { start: 0, end: 540 }
      }
    ];
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, this.particleConfigs[0].texture, {
      ...this.particleConfigs[0]
    });

    // 添加状态文本
    this.statusText = this.add.text(400, 50, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 添加说明文本
    const instructionText = this.add.text(400, 550, 'Click to switch particle effect', {
      fontSize: '18px',
      color: '#aaaaaa'
    });
    instructionText.setOrigin(0.5);

    // 更新状态显示
    this.updateStatus();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.switchParticle();
      }
    });
  }

  switchParticle() {
    // 切换到下一个粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;
    
    // 获取当前配置
    const config = this.particleConfigs[this.currentParticleIndex];
    
    // 移除旧的发射器
    if (this.emitter) {
      this.emitter.destroy();
    }
    
    // 创建新的发射器
    this.emitter = this.add.particles(400, 300, config.texture, {
      ...config
    });
    
    // 更新状态显示
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText(`Particle Type: ${this.currentParticleIndex + 1} / 20`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleShowcaseScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);