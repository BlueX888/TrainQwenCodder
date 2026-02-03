class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      currentParticleIndex: 0,
      particleTypeChanges: 0,
      totalParticleTypes: 12,
      colorHistory: []
    };

    // 定义12种颜色配置
    const colors = [
      { name: 'Red', tint: 0xff0000 },
      { name: 'Green', tint: 0x00ff00 },
      { name: 'Blue', tint: 0x0000ff },
      { name: 'Yellow', tint: 0xffff00 },
      { name: 'Cyan', tint: 0x00ffff },
      { name: 'Magenta', tint: 0xff00ff },
      { name: 'Orange', tint: 0xff8800 },
      { name: 'Purple', tint: 0x8800ff },
      { name: 'Pink', tint: 0xff88ff },
      { name: 'Lime', tint: 0x88ff00 },
      { name: 'Teal', tint: 0x008888 },
      { name: 'Gold', tint: 0xffd700 }
    ];

    // 创建粒子纹理（白色圆形，后续用tint着色）
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();

    // 为每种颜色创建配置
    this.particleConfigs = colors.map(color => ({
      name: color.name,
      config: {
        speed: { min: 100, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 50,
        tint: color.tint,
        blendMode: 'ADD'
      }
    }));

    // 创建粒子发射器
    this.particles = this.add.particles(400, 300, 'particle', this.particleConfigs[0].config);

    // 显示当前粒子类型文本
    this.particleText = this.add.text(10, 10, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateParticleText();

    // 添加提示文本
    this.add.text(10, 50, 'Right Click to Switch Particle Type', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.switchParticleType();
      }
    });

    // 监听鼠标移动，粒子跟随鼠标
    this.input.on('pointermove', (pointer) => {
      this.particles.setPosition(pointer.x, pointer.y);
    });

    // 记录初始状态
    this.logParticleChange();

    console.log('[ParticleSystem] Initialized with 12 particle types');
    console.log('[ParticleSystem] Right-click to switch types');
  }

  switchParticleType() {
    // 切换到下一个粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;
    
    // 更新粒子发射器配置
    const newConfig = this.particleConfigs[this.currentParticleIndex].config;
    
    // 停止当前发射器
    this.particles.stop();
    
    // 移除旧的发射器并创建新的
    this.particles.destroy();
    this.particles = this.add.particles(
      this.input.activePointer.x || 400,
      this.input.activePointer.y || 300,
      'particle',
      newConfig
    );

    // 更新显示文本
    this.updateParticleText();

    // 更新信号
    window.__signals__.currentParticleIndex = this.currentParticleIndex;
    window.__signals__.particleTypeChanges++;
    
    this.logParticleChange();

    console.log(`[ParticleSystem] Switched to: ${this.particleConfigs[this.currentParticleIndex].name} (${this.currentParticleIndex + 1}/12)`);
  }

  updateParticleText() {
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    this.particleText.setText(
      `Particle Type: ${currentConfig.name} (${this.currentParticleIndex + 1}/12)`
    );
    
    // 更新文本颜色以匹配粒子颜色
    const color = currentConfig.config.tint;
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    this.particleText.setColor(colorHex);
  }

  logParticleChange() {
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    window.__signals__.colorHistory.push({
      index: this.currentParticleIndex,
      name: currentConfig.name,
      tint: currentConfig.config.tint,
      timestamp: Date.now()
    });

    // 输出JSON格式的信号
    console.log(JSON.stringify({
      event: 'particleTypeChange',
      currentIndex: this.currentParticleIndex,
      particleName: currentConfig.name,
      totalChanges: window.__signals__.particleTypeChanges,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

new Phaser.Game(config);