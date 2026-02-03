// 完整的 Phaser3 粒子切换游戏
class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.currentParticleIndex = 0;
    this.particleConfigs = [];
    this.emitter = null;
  }

  preload() {
    // 初始化可验证信号
    window.__signals__ = {
      currentParticleIndex: 0,
      totalParticleTypes: 5,
      switchCount: 0,
      particleColors: []
    };
  }

  create() {
    // 定义 5 种粒子配置
    this.particleConfigs = [
      {
        name: 'red',
        color: 0xff0000,
        tint: 0xff0000,
        displayName: 'Red Particles'
      },
      {
        name: 'green',
        color: 0x00ff00,
        tint: 0x00ff00,
        displayName: 'Green Particles'
      },
      {
        name: 'blue',
        color: 0x0000ff,
        tint: 0x0000ff,
        displayName: 'Blue Particles'
      },
      {
        name: 'yellow',
        color: 0xffff00,
        tint: 0xffff00,
        displayName: 'Yellow Particles'
      },
      {
        name: 'purple',
        color: 0xff00ff,
        tint: 0xff00ff,
        displayName: 'Purple Particles'
      }
    ];

    // 创建 5 种颜色的粒子纹理
    this.particleConfigs.forEach(config => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(config.name, 16, 16);
      graphics.destroy();
    });

    // 更新信号
    window.__signals__.particleColors = this.particleConfigs.map(c => c.displayName);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, this.particleConfigs[0].name, {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 100,
      gravityY: 50
    });

    // 添加提示文本
    this.instructionText = this.add.text(400, 50, 'Click to switch particle type', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 当前粒子类型显示
    this.particleTypeText = this.add.text(400, 100, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 更新显示
    this.updateParticleDisplay();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.switchParticleType();
      }
    });

    // 添加统计信息显示
    this.statsText = this.add.text(10, 550, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.updateStatsDisplay();

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_started',
      particleTypes: this.particleConfigs.length,
      initialType: this.particleConfigs[0].displayName
    }));
  }

  switchParticleType() {
    // 切换到下一种粒子类型
    this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleConfigs.length;
    
    // 更新信号
    window.__signals__.currentParticleIndex = this.currentParticleIndex;
    window.__signals__.switchCount++;

    // 更新粒子发射器
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    
    // 停止当前发射器
    this.emitter.stop();
    
    // 移除旧的发射器
    this.emitter.destroy();
    
    // 创建新的发射器
    this.emitter = this.add.particles(400, 300, currentConfig.name, {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 100,
      gravityY: 50
    });

    // 更新显示
    this.updateParticleDisplay();
    this.updateStatsDisplay();

    // 日志输出
    console.log(JSON.stringify({
      event: 'particle_switched',
      newType: currentConfig.displayName,
      index: this.currentParticleIndex,
      totalSwitches: window.__signals__.switchCount
    }));
  }

  updateParticleDisplay() {
    const currentConfig = this.particleConfigs[this.currentParticleIndex];
    this.particleTypeText.setText(currentConfig.displayName);
    this.particleTypeText.setColor('#' + currentConfig.color.toString(16).padStart(6, '0'));
  }

  updateStatsDisplay() {
    const stats = `Particle Type: ${this.currentParticleIndex + 1}/${this.particleConfigs.length} | Switches: ${window.__signals__.switchCount}`;
    this.statsText.setText(stats);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证函数
window.getGameState = function() {
  return {
    signals: window.__signals__,
    timestamp: Date.now()
  };
};