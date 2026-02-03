class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDeathCount = 0; // 状态信号：敌人死亡次数
    this.particleEmitCount = 0; // 状态信号：粒子发射次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1); // 灰色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建粒子纹理（红色小方块）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff0000, 1); // 红色粒子
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建灰色敌人（可点击）
    this.enemy = this.add.sprite(400, 300, 'enemy');
    this.enemy.setInteractive();
    this.enemy.alive = true;

    // 创建粒子发射器
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 }, // 扩散速度
      angle: { min: 0, max: 360 }, // 向四周扩散
      scale: { start: 1, end: 0 }, // 从正常大小缩小到消失
      alpha: { start: 1, end: 0 }, // 透明度从1到0
      lifespan: 3000, // 持续3秒
      quantity: 5, // 每次发射5个粒子
      frequency: -1, // 不自动发射，手动触发
      blendMode: 'NORMAL'
    });

    // 点击敌人触发死亡
    this.enemy.on('pointerdown', () => {
      if (this.enemy.alive) {
        this.killEnemy(this.enemy);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(400, 100, 'Click the gray enemy to trigger particle explosion', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 5秒后自动重置敌人（用于测试）
    this.time.addEvent({
      delay: 5000,
      callback: this.resetEnemy,
      callbackScope: this,
      loop: true
    });
  }

  killEnemy(enemy) {
    if (!enemy.alive) return;

    enemy.alive = false;
    this.enemyDeathCount++;

    // 在敌人位置发射粒子
    this.particleEmitter.setPosition(enemy.x, enemy.y);
    this.particleEmitter.explode(5); // 立即发射5个粒子
    this.particleEmitCount++;

    // 敌人淡出并销毁
    this.tweens.add({
      targets: enemy,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        enemy.setVisible(false);
      }
    });

    this.updateStatusText();

    // 3秒后重置敌人（粒子效果结束后）
    this.time.delayedCall(3000, () => {
      this.resetEnemy();
    });
  }

  resetEnemy() {
    if (!this.enemy.alive) {
      this.enemy.setAlpha(1);
      this.enemy.setVisible(true);
      this.enemy.alive = true;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Enemy Deaths: ${this.enemyDeathCount}\n` +
      `Particle Explosions: ${this.particleEmitCount}\n` +
      `Enemy Status: ${this.enemy.alive ? 'Alive' : 'Dead'}`
    );
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
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