class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDeathCount = 0; // 验证状态信号
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建灰色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1); // 灰色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemyTexture', 40, 40);
    enemyGraphics.destroy();

    // 创建粒子纹理（红色小方块）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff4444, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particleTexture', 8, 8);
    particleGraphics.destroy();

    // 创建敌人精灵
    this.enemy = this.add.sprite(400, 300, 'enemyTexture');
    this.enemy.setInteractive();

    // 创建粒子发射器
    this.particleEmitter = this.add.particles(0, 0, 'particleTexture', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 4000, // 持续4秒
      gravityY: 0,
      quantity: 10, // 每次发射10个粒子
      frequency: -1, // 手动触发，不自动发射
      blendMode: 'ADD'
    });

    // 停止自动发射
    this.particleEmitter.stop();

    // 添加键盘输入监听
    this.input.keyboard.on('keydown-SPACE', () => {
      this.killEnemy();
    });

    // 添加鼠标点击监听
    this.enemy.on('pointerdown', () => {
      this.killEnemy();
    });

    // 添加提示文本
    this.add.text(10, 10, 'Press SPACE or Click Enemy to Trigger Explosion', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示死亡计数
    this.deathCountText = this.add.text(10, 40, `Deaths: ${this.enemyDeathCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    });

    // 添加说明文本
    this.add.text(10, 70, 'Particles: 10 | Duration: 4 seconds', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  killEnemy() {
    if (!this.enemy.visible) {
      return; // 已经死亡，避免重复触发
    }

    // 记录敌人位置
    const enemyX = this.enemy.x;
    const enemyY = this.enemy.y;

    // 隐藏敌人
    this.enemy.setVisible(false);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(enemyX, enemyY);
    this.particleEmitter.explode(10); // 一次性发射10个粒子

    // 更新死亡计数
    this.enemyDeathCount++;
    this.deathCountText.setText(`Deaths: ${this.enemyDeathCount}`);

    // 4秒后重新生成敌人（演示可重复触发）
    this.time.delayedCall(4000, () => {
      this.respawnEnemy();
    });
  }

  respawnEnemy() {
    // 在随机位置重新生成敌人
    const randomX = Phaser.Math.Between(100, 700);
    const randomY = Phaser.Math.Between(100, 500);
    
    this.enemy.setPosition(randomX, randomY);
    this.enemy.setVisible(true);

    // 添加闪烁效果表示重生
    this.tweens.add({
      targets: this.enemy,
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
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

const game = new Phaser.Game(config);