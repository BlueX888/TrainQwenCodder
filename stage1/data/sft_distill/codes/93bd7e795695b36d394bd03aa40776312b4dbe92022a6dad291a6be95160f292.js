// 全局信号对象，用于验证状态
window.__signals__ = {
  currentParticleType: 0,
  particleTypeChanges: 0,
  totalParticlesEmitted: 0,
  particleColors: []
};

class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentType = 0;
    this.particleConfigs = [];
    this.emitter = null;
    this.infoText = null;
  }

  preload() {
    // 定义10种不同颜色的粒子配置
    this.particleConfigs = [
      { name: '红色火焰', color: 0xff0000, tint: [0xff0000, 0xff6600, 0xffaa00] },
      { name: '蓝色冰霜', color: 0x0088ff, tint: [0x0088ff, 0x00ccff, 0x88ffff] },
      { name: '绿色自然', color: 0x00ff00, tint: [0x00ff00, 0x88ff00, 0xaaff88] },
      { name: '紫色魔法', color: 0x8800ff, tint: [0x8800ff, 0xaa00ff, 0xff00ff] },
      { name: '黄色闪电', color: 0xffff00, tint: [0xffff00, 0xffcc00, 0xff8800] },
      { name: '青色水波', color: 0x00ffff, tint: [0x00ffff, 0x00cccc, 0x0088aa] },
      { name: '橙色熔岩', color: 0xff8800, tint: [0xff8800, 0xff4400, 0xcc2200] },
      { name: '粉色樱花', color: 0xff88cc, tint: [0xff88cc, 0xffaadd, 0xffccee] },
      { name: '白色星光', color: 0xffffff, tint: [0xffffff, 0xccccff, 0xaaaaff] },
      { name: '暗色阴影', color: 0x444444, tint: [0x444444, 0x666666, 0x888888] }
    ];

    // 存储颜色信息到signals
    window.__signals__.particleColors = this.particleConfigs.map(c => ({
      name: c.name,
      color: c.color
    }));
  }

  create() {
    // 创建粒子纹理（使用Graphics绘制圆形）
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });

    // 创建初始粒子发射器
    this.createEmitter(this.currentType);

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 添加提示文本
    this.add.text(10, 560, '右键点击切换粒子类型', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标右键事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.switchParticleType();
      }
    });

    // 监听鼠标移动，让粒子跟随鼠标
    this.input.on('pointermove', (pointer) => {
      if (this.emitter) {
        this.emitter.setPosition(pointer.x, pointer.y);
      }
    });

    // 初始化粒子发射器位置
    this.emitter.setPosition(400, 300);

    // 记录初始状态
    this.logState('初始化完成');
  }

  createEmitter(typeIndex) {
    // 销毁旧的发射器
    if (this.emitter) {
      this.emitter.stop();
      this.emitter.destroy();
    }

    const config = this.particleConfigs[typeIndex];
    
    // 创建新的粒子发射器
    this.emitter = this.add.particles(400, 300, `particle${typeIndex}`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 50,
      blendMode: 'ADD',
      tint: config.tint,
      quantity: 2,
      maxParticles: 100
    });

    // 更新全局信号
    window.__signals__.totalParticlesEmitted += 0; // 将在update中累加
  }

  switchParticleType() {
    // 切换到下一种粒子类型
    this.currentType = (this.currentType + 1) % this.particleConfigs.length;
    
    // 创建新的发射器
    this.createEmitter(this.currentType);
    
    // 更新信息显示
    this.updateInfoText();
    
    // 更新全局信号
    window.__signals__.currentParticleType = this.currentType;
    window.__signals__.particleTypeChanges++;
    
    // 记录状态变化
    this.logState('切换粒子类型');
  }

  updateInfoText() {
    const config = this.particleConfigs[this.currentType];
    const colorHex = '#' + config.color.toString(16).padStart(6, '0');
    
    this.infoText.setText([
      `当前类型: ${this.currentType + 1}/10`,
      `名称: ${config.name}`,
      `颜色: ${colorHex}`,
      `切换次数: ${window.__signals__.particleTypeChanges}`
    ]);
  }

  logState(action) {
    const logEntry = {
      timestamp: Date.now(),
      action: action,
      currentType: this.currentType,
      particleName: this.particleConfigs[this.currentType].name,
      totalChanges: window.__signals__.particleTypeChanges
    };
    
    console.log('[PARTICLE_STATE]', JSON.stringify(logEntry));
  }

  update(time, delta) {
    // 统计活跃粒子数（近似值）
    if (this.emitter) {
      const aliveCount = this.emitter.getAliveParticleCount();
      window.__signals__.totalParticlesEmitted = Math.max(
        window.__signals__.totalParticlesEmitted,
        aliveCount
      );
    }
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始信号状态
console.log('[INIT_SIGNALS]', JSON.stringify(window.__signals__));