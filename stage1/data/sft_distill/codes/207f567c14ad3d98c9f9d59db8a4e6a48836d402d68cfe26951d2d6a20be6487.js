class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDeathCount = 0; // 状态信号：记录敌人死亡次数
  }

  preload() {
    // 不需要加载外部资源
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
    particleGraphics.fillStyle(0xff0000, 1); // 红色粒子
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particleTexture', 8, 8);
    particleGraphics.destroy();

    // 创建粒子发射器（初始状态关闭）
    this.particleEmitter = this.add.particles(0, 0, 'particleTexture', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 3000, // 粒子存活3秒
      quantity: 5, // 每次发射5个粒子
      frequency: -1, // 手动触发，不自动发射
      gravityY: 0
    });

    // 创建灰色敌人
    this.enemy = this.add.sprite(400, 300, 'enemyTexture');
    this.enemy.setInteractive();

    // 点击敌人触发死亡效果
    this.enemy.on('pointerdown', () => {
      this.triggerEnemyDeath();
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click the gray enemy to trigger particle explosion', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示死亡计数
    this.deathText = this.add.text(10, 40, `Enemy Deaths: ${this.enemyDeathCount}`, {
      fontSize: '20px',
      color: '#ffff00'
    });

    // 添加重置按钮
    const resetButton = this.add.text(10, 70, 'Reset Enemy', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    resetButton.setInteractive();
    resetButton.on('pointerdown', () => {
      this.resetEnemy();
    });
  }

  triggerEnemyDeath() {
    if (!this.enemy.visible) return; // 如果敌人已经死亡，不重复触发

    // 增加死亡计数
    this.enemyDeathCount++;
    this.deathText.setText(`Enemy Deaths: ${this.enemyDeathCount}`);

    // 获取敌人位置
    const enemyX = this.enemy.x;
    const enemyY = this.enemy.y;

    // 隐藏敌人
    this.enemy.setVisible(false);

    // 在敌人位置发射粒子
    this.particleEmitter.setPosition(enemyX, enemyY);
    this.particleEmitter.explode(5); // 发射5个粒子

    // 3秒后停止粒子效果（粒子会自然消失，因为 lifespan 设置为 3000ms）
    this.time.delayedCall(3000, () => {
      console.log(`Particle explosion completed. Total deaths: ${this.enemyDeathCount}`);
    });
  }

  resetEnemy() {
    // 重置敌人到初始位置
    this.enemy.setPosition(400, 300);
    this.enemy.setVisible(true);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);