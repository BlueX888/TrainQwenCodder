class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.switchCount = 0;
    
    // 定义10种不同颜色的粒子配置
    this.particleConfigs = [
      { name: 'Red', color: 0xff0000, tint: [0xff0000, 0xff6666] },
      { name: 'Blue', color: 0x0000ff, tint: [0x0000ff, 0x6666ff] },
      { name: 'Green', color: 0x00ff00, tint: [0x00ff00, 0x66ff66] },
      { name: 'Yellow', color: 0xffff00, tint: [0xffff00, 0xffff66] },
      { name: 'Purple', color: 0xff00ff, tint: [0xff00ff, 0xff66ff] },
      { name: 'Cyan', color: 0x00ffff, tint: [0x00ffff, 0x66ffff] },
      { name: 'Orange', color: 0xff8800, tint: [0xff8800, 0xffaa44] },
      { name: 'Pink', color: 0xff69b4, tint: [0xff69b4, 0xffb6d9] },
      { name: 'Lime', color: 0xaaff00, tint: [0xaaff00, 0xccff66] },
      { name: 'Indigo', color: 0x4b0082, tint: [0x4b0082, 0x8b44cc] }
    ];
    
    // 初始化验证信号
    window.__signals__ = {
      currentParticleType: this.particleConfigs[0].name,
      currentParticleIndex: 0,
      switchCount: 0,
      totalParticleTypes: 10,
      history: []
    };
  }

  preload() {
    // 为每种颜色创建粒子纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle_${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle_0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 50,
      blendMode: 'ADD',
      tint: this.particleConfigs[0].tint
    });

    // 添加提示文本
    this.instructionText = this.add.text(400, 50, 'Right Click to Switch Particle Type', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 显示当前粒子类型
    this.typeText = this.add.text(400, 100, `Current: ${this.particleConfigs[0].name} (1/10)`, {
      fontSize: '32px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 显示切换次数
    this.switchText = this.add.text(400, 550, `Switches: ${this.switchCount}`, {
      fontSize: '20px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.switchParticleType();
      }
    });

    // 让粒子跟随鼠标
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });

    // 输出初始信号
    this.logSignal('Initial particle type set');
    
    console.log('Particle System Initialized');
    console.log('Right-click to switch between 10 particle types');
  }

  switchParticleType() {
    // 切换到下一个粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;
    this.switchCount++;

    const currentConfig = this.particleConfigs[this.currentParticleIndex];

    // 更新粒子发射器纹理和配置
    this.emitter.setTexture(`particle_${this.currentParticleIndex}`);
    this.emitter.setConfig({
      tint: currentConfig.tint
    });

    // 更新文本显示
    this.typeText.setText(`Current: ${currentConfig.name} (${this.currentParticleIndex + 1}/10)`);
    this.typeText.setColor(this.getColorString(currentConfig.color));
    this.switchText.setText(`Switches: ${this.switchCount}`);

    // 添加切换特效
    this.tweens.add({
      targets: this.typeText,
      scale: { from: 1.5, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 输出验证信号
    this.logSignal('Particle type switched');

    console.log(`Switched to: ${currentConfig.name} (${this.currentParticleIndex + 1}/10)`);
  }

  getColorString(colorHex) {
    return '#' + colorHex.toString(16).padStart(6, '0');
  }

  logSignal(action) {
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    
    window.__signals__ = {
      currentParticleType: currentConfig.name,
      currentParticleIndex: this.currentParticleIndex,
      switchCount: this.switchCount,
      totalParticleTypes: this.particleConfigs.length,
      timestamp: Date.now(),
      history: [
        ...window.__signals__.history,
        {
          action: action,
          particleType: currentConfig.name,
          index: this.currentParticleIndex,
          switchCount: this.switchCount,
          timestamp: Date.now()
        }
      ].slice(-20) // 保留最近20条记录
    };

    // 输出JSON格式的日志
    console.log(JSON.stringify({
      event: 'particle_switch',
      data: {
        currentType: currentConfig.name,
        index: this.currentParticleIndex,
        switchCount: this.switchCount,
        color: currentConfig.color
      }
    }));
  }

  update(time, delta) {
    // 可选：添加周期性的粒子爆发效果
    if (Math.floor(time / 3000) !== Math.floor((time - delta) / 3000)) {
      this.emitter.explode(30);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

new Phaser.Game(config);