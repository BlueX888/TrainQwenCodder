class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDeathCount = 0; // 状态信号：敌人死亡计数
    this.particleEmitCount = 0; // 状态信号：粒子发射计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1); // 橙色
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建粒子纹理（小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff8800, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建橙色敌人
    this.enemy = this.add.sprite(400, 300, 'enemy');
    this.enemy.setInteractive();

    // 创建粒子发射器（初始不发射）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 }, // 粒子速度
      angle: { min: 0, max: 360 }, // 360度扩散
      scale: { start: 1, end: 0 }, // 粒子从正常大小缩小到0
      alpha: { start: 1, end: 0 }, // 透明度从1到0
      lifespan: 2000, // 持续2秒
      quantity: 12, // 每次发射12个粒子
      frequency: -1, // 不自动发射，手动触发
      blendMode: 'ADD' // 叠加混合模式
    });

    // 停止自动发射
    this.particleEmitter.stop();

    // 添加提示文本
    this.add.text(20, 20, 'Press SPACE to kill enemy\nClick enemy to kill', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 添加状态显示文本
    this.statusText = this.add.text(20, 80, '', {
      fontSize: '16px',
      fill: '#00ff00'
    });
    this.updateStatusText();

    // 键盘输入：空格键触发敌人死亡
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.enemy.active) {
        this.killEnemy();
      }
    });

    // 点击敌人触发死亡
    this.enemy.on('pointerdown', () => {
      if (this.enemy.active) {
        this.killEnemy();
      }
    });

    // 3秒后自动重生敌人（用于演示）
    this.time.addEvent({
      delay: 3000,
      callback: this.respawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  killEnemy() {
    if (!this.enemy.active) return;

    // 更新状态计数
    this.enemyDeathCount++;
    this.particleEmitCount++;
    this.updateStatusText();

    // 在敌人位置发射粒子爆炸
    this.particleEmitter.setPosition(this.enemy.x, this.enemy.y);
    this.particleEmitter.explode(12); // 一次性发射12个粒子

    // 销毁敌人
    this.enemy.setActive(false);
    this.enemy.setVisible(false);

    // 添加爆炸音效提示（使用tweens模拟）
    this.cameras.main.shake(200, 0.005);

    console.log(`Enemy killed! Total deaths: ${this.enemyDeathCount}, Particle emits: ${this.particleEmitCount}`);
  }

  respawnEnemy() {
    if (this.enemy.active) return;

    // 重生敌人到随机位置
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    this.enemy.setPosition(x, y);
    this.enemy.setActive(true);
    this.enemy.setVisible(true);
    this.enemy.setAlpha(0);

    // 淡入效果
    this.tweens.add({
      targets: this.enemy,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    console.log(`Enemy respawned at (${x}, ${y})`);
  }

  updateStatusText() {
    this.statusText.setText(
      `Enemy Deaths: ${this.enemyDeathCount}\n` +
      `Particle Explosions: ${this.particleEmitCount}\n` +
      `Enemy Active: ${this.enemy ? this.enemy.active : false}`
    );
  }

  update(time, delta) {
    // 每帧更新状态显示
    if (this.enemy) {
      this.updateStatusText();
    }
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态访问接口（用于验证）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    enemyDeathCount: scene.enemyDeathCount,
    particleEmitCount: scene.particleEmitCount,
    enemyActive: scene.enemy ? scene.enemy.active : false
  };
};