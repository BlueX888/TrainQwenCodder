// 全局信号对象，用于验证状态
window.__signals__ = {
  currentParticleType: 0,
  totalParticleTypes: 12,
  switchCount: 0,
  particleColors: []
};

class ParticleScene extends Phaser.Scene {
  constructor() {
    super('ParticleScene');
    this.particleColors = [
      { name: 'Red', color: 0xff0000 },
      { name: 'Green', color: 0x00ff00 },
      { name: 'Blue', color: 0x0000ff },
      { name: 'Yellow', color: 0xffff00 },
      { name: 'Cyan', color: 0x00ffff },
      { name: 'Magenta', color: 0xff00ff },
      { name: 'Orange', color: 0xff8800 },
      { name: 'Purple', color: 0x8800ff },
      { name: 'Pink', color: 0xff88ff },
      { name: 'Lime', color: 0x88ff00 },
      { name: 'Teal', color: 0x008888 },
      { name: 'White', color: 0xffffff }
    ];
    this.currentTypeIndex = 0;
    this.emitter = null;
    this.infoText = null;
  }

  preload() {
    // 创建12种颜色的粒子纹理
    this.particleColors.forEach((colorData, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(colorData.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle_${index}`, 16, 16);
      graphics.destroy();
      
      // 记录颜色信息到signals
      window.__signals__.particleColors.push({
        index: index,
        name: colorData.name,
        color: colorData.color
      });
    });
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器
    this.emitter = this.add.particles(400, 300, `particle_0`, {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      maxParticles: 200,
      gravityY: 0
    });

    // 创建信息文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 监听鼠标右键事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.switchParticleType();
      }
    });

    // 监听鼠标移动，粒子跟随鼠标
    this.input.on('pointermove', (pointer) => {
      this.emitter.setPosition(pointer.x, pointer.y);
    });

    // 初始化signals
    window.__signals__.currentParticleType = this.currentTypeIndex;
    
    console.log(JSON.stringify({
      event: 'game_start',
      particleType: this.currentTypeIndex,
      particleName: this.particleColors[this.currentTypeIndex].name,
      timestamp: Date.now()
    }));
  }

  switchParticleType() {
    // 切换到下一个粒子类型
    this.currentTypeIndex = (this.currentTypeIndex + 1) % this.particleColors.length;
    
    // 更新粒子发射器的纹理
    this.emitter.setTexture(`particle_${this.currentTypeIndex}`);
    
    // 更新粒子颜色（使用tint）
    const currentColor = this.particleColors[this.currentTypeIndex].color;
    this.emitter.setParticleTint(currentColor);
    
    // 更新信息文本
    this.updateInfoText();
    
    // 更新全局信号
    window.__signals__.currentParticleType = this.currentTypeIndex;
    window.__signals__.switchCount++;
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'particle_switch',
      newType: this.currentTypeIndex,
      particleName: this.particleColors[this.currentTypeIndex].name,
      color: currentColor,
      switchCount: window.__signals__.switchCount,
      timestamp: Date.now()
    }));
  }

  updateInfoText() {
    const currentColor = this.particleColors[this.currentTypeIndex];
    this.infoText.setText([
      `Particle Type: ${this.currentTypeIndex + 1}/12`,
      `Color: ${currentColor.name}`,
      `Switches: ${window.__signals__.switchCount}`,
      '',
      'Right Click to Switch',
      'Move Mouse to Control'
    ]);
  }

  update(time, delta) {
    // 可选：添加一些动态效果
    // 例如周期性改变粒子速度
    const speedVariation = Math.sin(time * 0.001) * 50 + 150;
    this.emitter.setSpeed({ min: speedVariation - 50, max: speedVariation + 50 });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ParticleScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始化信息
console.log(JSON.stringify({
  event: 'game_initialized',
  totalParticleTypes: 12,
  colors: window.__signals__.particleColors.map(c => c.name),
  timestamp: Date.now()
}));