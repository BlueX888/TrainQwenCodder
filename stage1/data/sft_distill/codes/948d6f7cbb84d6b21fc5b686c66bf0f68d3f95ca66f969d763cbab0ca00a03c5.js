class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDeathCount = 0; // 状态信号：敌人死亡计数
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建灰色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1); // 灰色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemyTexture', 40, 40);
    enemyGraphics.destroy();

    // 创建粒子纹理（红色小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff0000, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particleTexture', 8, 8);
    particleGraphics.destroy();

    // 创建粒子发射器（初始状态为关闭）
    this.particleEmitter = this.add.particles(0, 0, 'particleTexture', {
      speed: { min: 100, max: 200 }, // 粒子扩散速度
      angle: { min: 0, max: 360 }, // 向四周发射
      scale: { start: 1, end: 0 }, // 从正常大小缩小到消失
      alpha: { start: 1, end: 0 }, // 从不透明到透明
      lifespan: 4000, // 粒子生命周期4秒
      gravityY: 50, // 轻微下落效果
      quantity: 10, // 每次爆炸发射10个粒子
      frequency: -1, // 不自动发射，手动触发
      blendMode: 'ADD' // 叠加混合模式，更炫酷
    });

    // 创建灰色敌人
    this.enemy = this.add.sprite(400, 300, 'enemyTexture');
    this.enemy.setInteractive({ useHandCursor: true });

    // 点击敌人触发死亡效果
    this.enemy.on('pointerdown', () => {
      this.killEnemy(this.enemy);
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click the gray enemy to trigger particle explosion', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示死亡计数
    this.deathCountText = this.add.text(10, 40, 'Enemy Deaths: 0', {
      fontSize: '20px',
      color: '#ffff00'
    });

    // 添加重置按钮（用于测试多次触发）
    const resetButton = this.add.text(10, 70, '[Reset Enemy]', {
      fontSize: '16px',
      color: '#00ff00'
    }).setInteractive({ useHandCursor: true });

    resetButton.on('pointerdown', () => {
      if (!this.enemy.active) {
        this.resetEnemy();
      }
    });
  }

  killEnemy(enemy) {
    if (!enemy.active) return;

    // 增加死亡计数
    this.enemyDeathCount++;
    this.deathCountText.setText(`Enemy Deaths: ${this.enemyDeathCount}`);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(enemy.x, enemy.y);
    this.particleEmitter.explode(10); // 立即发射10个粒子

    // 敌人死亡动画：缩小并淡出
    this.tweens.add({
      targets: enemy,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        enemy.setActive(false);
        enemy.setVisible(false);
      }
    });

    // 打印状态日志
    console.log(`Enemy killed! Total deaths: ${this.enemyDeathCount}`);
  }

  resetEnemy() {
    // 重置敌人状态用于测试
    this.enemy.setActive(true);
    this.enemy.setVisible(true);
    this.enemy.setScale(1);
    this.enemy.setAlpha(1);
    this.enemy.setPosition(
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(100, 500)
    );
    console.log('Enemy reset at new position');
  }

  update(time, delta) {
    // 可选：显示粒子系统状态
    // console.log('Active particles:', this.particleEmitter.getAliveParticleCount());
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