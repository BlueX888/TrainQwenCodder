class ParticleShowcaseScene extends Phaser.Scene {
  constructor() {
    super('ParticleShowcaseScene');
    this.currentParticleIndex = 0; // 状态信号：当前粒子索引
    this.totalParticleTypes = 20; // 状态信号：粒子总数
  }

  preload() {
    // 创建 20 种不同颜色的粒子纹理
    this.particleColors = [
      { name: 'red', color: 0xff0000, label: 'Red' },
      { name: 'green', color: 0x00ff00, label: 'Green' },
      { name: 'blue', color: 0x0000ff, label: 'Blue' },
      { name: 'yellow', color: 0xffff00, label: 'Yellow' },
      { name: 'cyan', color: 0x00ffff, label: 'Cyan' },
      { name: 'magenta', color: 0xff00ff, label: 'Magenta' },
      { name: 'orange', color: 0xff8800, label: 'Orange' },
      { name: 'purple', color: 0x8800ff, label: 'Purple' },
      { name: 'pink', color: 0xff88ff, label: 'Pink' },
      { name: 'lime', color: 0x88ff00, label: 'Lime' },
      { name: 'teal', color: 0x008888, label: 'Teal' },
      { name: 'navy', color: 0x000088, label: 'Navy' },
      { name: 'maroon', color: 0x880000, label: 'Maroon' },
      { name: 'olive', color: 0x888800, label: 'Olive' },
      { name: 'coral', color: 0xff7f50, label: 'Coral' },
      { name: 'gold', color: 0xffd700, label: 'Gold' },
      { name: 'silver', color: 0xc0c0c0, label: 'Silver' },
      { name: 'violet', color: 0xee82ee, label: 'Violet' },
      { name: 'indigo', color: 0x4b0082, label: 'Indigo' },
      { name: 'turquoise', color: 0x40e0d0, label: 'Turquoise' }
    ];

    // 为每种颜色生成纹理
    this.particleColors.forEach((colorData) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(colorData.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(colorData.name, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, this.particleColors[0].name, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    });

    // 创建信息文本
    this.infoText = this.add.text(400, 50, '', {
      fontSize: '32px',
      fill: '#ffffff',
      align: 'center',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 550, 'Use LEFT/RIGHT arrow keys to switch particle types', {
      fontSize: '20px',
      fill: '#aaaaaa',
      align: 'center',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 状态指示器
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '18px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 200; // 防止按键过快

    // 更新显示
    this.updateParticleDisplay();
  }

  update(time, delta) {
    // 处理左右键切换
    if (time - this.lastKeyPressTime > this.keyPressDelay) {
      if (this.cursors.left.isDown) {
        this.currentParticleIndex--;
        if (this.currentParticleIndex < 0) {
          this.currentParticleIndex = this.totalParticleTypes - 1;
        }
        this.updateParticleDisplay();
        this.lastKeyPressTime = time;
      } else if (this.cursors.right.isDown) {
        this.currentParticleIndex++;
        if (this.currentParticleIndex >= this.totalParticleTypes) {
          this.currentParticleIndex = 0;
        }
        this.updateParticleDisplay();
        this.lastKeyPressTime = time;
      }
    }

    // 更新状态信息
    this.statusText.setText([
      `Particle Index: ${this.currentParticleIndex + 1}/${this.totalParticleTypes}`,
      `Active Particles: ${this.emitter.getAliveParticleCount()}`,
      `Total Emitted: ${this.emitter.getParticleCount()}`
    ]);
  }

  updateParticleDisplay() {
    const currentColor = this.particleColors[this.currentParticleIndex];
    
    // 更新粒子纹理
    this.emitter.setTexture(currentColor.name);
    
    // 为每种粒子类型设置不同的效果
    const effects = this.getParticleEffect(this.currentParticleIndex);
    this.emitter.setConfig(effects);
    
    // 更新信息文本
    this.infoText.setText(`Particle Type ${this.currentParticleIndex + 1}: ${currentColor.label}`);
    this.infoText.setColor('#' + currentColor.color.toString(16).padStart(6, '0'));
  }

  getParticleEffect(index) {
    // 为不同索引返回不同的粒子效果配置
    const baseConfig = {
      speed: { min: 100, max: 200 },
      lifespan: 2000,
      frequency: 50,
      maxParticles: 100,
      blendMode: 'ADD'
    };

    const effects = [
      // 0: 爆炸效果
      { ...baseConfig, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 } },
      // 1: 喷泉效果
      { ...baseConfig, angle: { min: -110, max: -70 }, gravityY: 300, scale: { start: 0.8, end: 0.3 }, alpha: { start: 1, end: 0.5 } },
      // 2: 螺旋效果
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: { min: 50, max: 100 }, scale: { start: 1.2, end: 0 }, rotate: { start: 0, end: 360 } },
      // 3: 向上飘散
      { ...baseConfig, angle: { min: -100, max: -80 }, speed: { min: 80, max: 150 }, scale: { start: 0.6, end: 0.2 }, alpha: { start: 1, end: 0 } },
      // 4: 圆形扩散
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: 150, scale: { start: 0.5, end: 1.5 }, alpha: { start: 1, end: 0 } },
      // 5: 波浪效果
      { ...baseConfig, angle: { min: -45, max: 45 }, speed: { min: 100, max: 200 }, scale: { start: 1, end: 0.3 }, frequency: 30 },
      // 6: 雨滴效果
      { ...baseConfig, angle: { min: 85, max: 95 }, gravityY: 400, speed: { min: 200, max: 300 }, scale: 0.4, lifespan: 1500 },
      // 7: 烟雾效果
      { ...baseConfig, angle: { min: -100, max: -80 }, speed: { min: 30, max: 60 }, scale: { start: 0.3, end: 1.5 }, alpha: { start: 0.8, end: 0 }, frequency: 80 },
      // 8: 星星闪烁
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: { min: 20, max: 80 }, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0, ease: 'Sine.easeInOut' }, frequency: 100 },
      // 9: 旋转发射
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: 120, scale: 0.8, rotate: { start: 0, end: 720 } },
      // 10: 脉冲效果
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: { min: 150, max: 250 }, scale: { start: 1.5, end: 0 }, frequency: 200, quantity: 10 },
      // 11: 左右摆动
      { ...baseConfig, angle: { min: -135, max: -45 }, speed: { min: 100, max: 180 }, scale: { start: 0.7, end: 0.2 } },
      // 12: 向下坠落
      { ...baseConfig, angle: { min: 80, max: 100 }, gravityY: 500, speed: { min: 50, max: 100 }, scale: 0.6 },
      // 13: 快速爆发
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: { min: 300, max: 400 }, scale: { start: 0.8, end: 0 }, lifespan: 1000, frequency: 30 },
      // 14: 缓慢扩散
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: { min: 20, max: 50 }, scale: { start: 1, end: 0.5 }, lifespan: 3000, frequency: 100 },
      // 15: 对角线喷射
      { ...baseConfig, angle: { min: -60, max: -30 }, speed: { min: 150, max: 250 }, scale: { start: 0.9, end: 0.1 } },
      // 16: 环形爆炸
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: 180, scale: { start: 0.4, end: 1.2 }, alpha: { start: 1, end: 0 }, frequency: 100, quantity: 8 },
      // 17: 闪电效果
      { ...baseConfig, angle: { min: -100, max: -80 }, speed: { min: 200, max: 400 }, scale: { start: 1.2, end: 0 }, lifespan: 800, frequency: 20 },
      // 18: 漩涡效果
      { ...baseConfig, angle: { min: 0, max: 360 }, speed: { min: 80, max: 120 }, scale: { start: 1, end: 0 }, rotate: { start: 0, end: 1080 }, lifespan: 2500 },
      // 19: 彩虹喷泉
      { ...baseConfig, angle: { min: -120, max: -60 }, gravityY: 250, speed: { min: 150, max: 250 }, scale: { start: 1, end: 0.4 }, alpha: { start: 1, end: 0.3 } }
    ];

    return effects[index % effects.length];
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