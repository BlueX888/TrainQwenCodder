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
    // 创建粉色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('pinkEnemy', 40, 40);
    enemyGraphics.destroy();

    // 创建粒子纹理（小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff69b4, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建粉色敌人
    this.enemy = this.add.sprite(400, 300, 'pinkEnemy');
    this.enemy.setInteractive();

    // 创建粒子发射器（初始状态不发射）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 300 }, // 粒子速度范围
      angle: { min: 0, max: 360 }, // 向四周扩散
      scale: { start: 1, end: 0 }, // 从正常大小缩小到消失
      alpha: { start: 1, end: 0 }, // 从完全不透明到透明
      lifespan: 1000, // 持续1秒
      quantity: 20, // 一次发射20个粒子
      frequency: -1, // 不自动发射，手动触发
      blendMode: 'ADD' // 叠加混合模式，更炫酷
    });

    // 添加说明文字
    this.add.text(10, 10, 'Press SPACE to kill enemy', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 添加状态显示
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
    this.updateStatusText();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听鼠标点击敌人
    this.enemy.on('pointerdown', () => {
      this.killEnemy();
    });

    // 添加提示文字
    this.add.text(10, 70, 'Or click on the enemy', {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  update() {
    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.killEnemy();
    }
  }

  killEnemy() {
    if (!this.enemy.visible) {
      // 如果敌人已经死亡，重置敌人
      this.resetEnemy();
      return;
    }

    // 记录敌人位置
    const enemyX = this.enemy.x;
    const enemyY = this.enemy.y;

    // 隐藏敌人
    this.enemy.setVisible(false);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(enemyX, enemyY);
    this.particleEmitter.explode(20); // 一次性发射20个粒子

    // 更新状态
    this.enemyDeathCount++;
    this.particleEmitCount++;
    this.updateStatusText();

    // 1秒后重置敌人（粒子效果结束后）
    this.time.delayedCall(1000, () => {
      this.resetEnemy();
    });
  }

  resetEnemy() {
    // 随机位置重置敌人
    const randomX = Phaser.Math.Between(100, 700);
    const randomY = Phaser.Math.Between(100, 500);
    this.enemy.setPosition(randomX, randomY);
    this.enemy.setVisible(true);
  }

  updateStatusText() {
    this.statusText.setText(
      `Enemy Deaths: ${this.enemyDeathCount} | Particle Bursts: ${this.particleEmitCount}`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  // 固定随机种子以保持行为确定性
  seed: ['phaser3', 'particle', 'explosion']
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证函数（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getEnemyDeathCount: () => game.scene.scenes[0].enemyDeathCount,
    getParticleEmitCount: () => game.scene.scenes[0].particleEmitCount
  };
}