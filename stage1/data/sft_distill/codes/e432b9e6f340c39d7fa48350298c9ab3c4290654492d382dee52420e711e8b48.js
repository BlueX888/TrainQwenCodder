class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDeathCount = 0; // 验证状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1); // 灰色
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建粒子纹理（红色小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff4444, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建粒子发射器（初始停止）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000, // 持续2秒
      gravityY: 0,
      quantity: 3, // 每次发射3个粒子
      frequency: -1, // 手动触发，不自动发射
      blendMode: 'ADD'
    });

    // 创建灰色敌人
    this.enemy = this.add.sprite(400, 300, 'enemy');
    this.enemy.setInteractive();
    this.enemy.alive = true;

    // 点击敌人触发死亡
    this.enemy.on('pointerdown', () => {
      if (this.enemy.alive) {
        this.killEnemy();
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click the gray enemy to trigger particle explosion', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示死亡计数
    this.deathText = this.add.text(10, 40, `Deaths: ${this.enemyDeathCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    });

    // 添加重置按钮
    const resetButton = this.add.text(10, 70, '[Reset Enemy]', {
      fontSize: '18px',
      color: '#00ff00'
    }).setInteractive();

    resetButton.on('pointerdown', () => {
      this.resetEnemy();
    });
  }

  killEnemy() {
    this.enemy.alive = false;
    this.enemyDeathCount++;
    this.deathText.setText(`Deaths: ${this.enemyDeathCount}`);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(this.enemy.x, this.enemy.y);
    this.particleEmitter.explode(3); // 发射3个粒子

    // 敌人淡出消失
    this.tweens.add({
      targets: this.enemy,
      alpha: 0,
      scale: 0.5,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.enemy.setVisible(false);
      }
    });

    console.log(`Enemy killed! Total deaths: ${this.enemyDeathCount}`);
    console.log('Particle explosion triggered at position:', this.enemy.x, this.enemy.y);
  }

  resetEnemy() {
    this.enemy.alive = true;
    this.enemy.setVisible(true);
    this.enemy.setAlpha(1);
    this.enemy.setScale(1);
    this.enemy.setPosition(400, 300);
    console.log('Enemy reset');
  }

  update(time, delta) {
    // 可以在这里添加更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);