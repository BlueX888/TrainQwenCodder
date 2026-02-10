class ParticleSwitchScene extends Phaser.Scene {
  constructor() {
    super('ParticleSwitchScene');
    this.currentParticleIndex = 0;
    this.particleTypes = [
      { name: 'Red Fire', color: 0xff0000 },
      { name: 'Green Energy', color: 0x00ff00 },
      { name: 'Blue Water', color: 0x0099ff },
      { name: 'Yellow Lightning', color: 0xffff00 },
      { name: 'Purple Magic', color: 0xff00ff }
    ];
  }

  preload() {
    // 创建5种颜色的粒子纹理
    this.particleTypes.forEach((type, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(type.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle${index}`, 16, 16);
      graphics.destroy();
    });
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建粒子发射器数组
    this.emitters = [];
    
    this.particleTypes.forEach((type, index) => {
      const emitter = this.add.particles(400, 300, `particle${index}`, {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        frequency: 50,
        maxParticles: 100,
        blendMode: 'ADD'
      });
      
      // 初始时只显示第一个粒子发射器
      emitter.setVisible(index === 0);
      this.emitters.push(emitter);
    });

    // 添加标题文本
    this.add.text(400, 50, 'Particle Switcher', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加当前粒子类型显示
    this.particleText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加操作提示
    this.add.text(400, 550, 'Press Arrow Keys to Switch Particles', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 添加粒子索引显示
    this.indexText = this.add.text(400, 150, '', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 记录按键状态，防止连续触发
    this.keyPressed = false;

    // 更新显示
    this.updateParticleDisplay();
  }

  update() {
    // 检测方向键输入
    const anyKeyDown = this.cursors.left.isDown || 
                       this.cursors.right.isDown || 
                       this.cursors.up.isDown || 
                       this.cursors.down.isDown;

    if (anyKeyDown && !this.keyPressed) {
      this.keyPressed = true;
      
      if (this.cursors.left.isDown || this.cursors.down.isDown) {
        // 向左或向下切换到上一个粒子
        this.currentParticleIndex = (this.currentParticleIndex - 1 + this.particleTypes.length) % this.particleTypes.length;
        this.switchParticle();
      } else if (this.cursors.right.isDown || this.cursors.up.isDown) {
        // 向右或向上切换到下一个粒子
        this.currentParticleIndex = (this.currentParticleIndex + 1) % this.particleTypes.length;
        this.switchParticle();
      }
    } else if (!anyKeyDown) {
      this.keyPressed = false;
    }
  }

  switchParticle() {
    // 隐藏所有粒子发射器
    this.emitters.forEach(emitter => {
      emitter.setVisible(false);
    });

    // 显示当前选中的粒子发射器
    this.emitters[this.currentParticleIndex].setVisible(true);

    // 更新显示文本
    this.updateParticleDisplay();
  }

  updateParticleDisplay() {
    const currentType = this.particleTypes[this.currentParticleIndex];
    this.particleText.setText(`Current: ${currentType.name}`);
    this.indexText.setText(`[${this.currentParticleIndex + 1} / ${this.particleTypes.length}]`);
    
    // 更新文本颜色以匹配粒子颜色
    const hexColor = '#' + currentType.color.toString(16).padStart(6, '0');
    this.particleText.setColor(hexColor);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: ParticleSwitchScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);

// 可验证的状态信号
game.registry.set('currentParticleIndex', 0);
game.events.on('step', () => {
  const scene = game.scene.getScene('ParticleSwitchScene');
  if (scene && scene.currentParticleIndex !== undefined) {
    game.registry.set('currentParticleIndex', scene.currentParticleIndex);
  }
});