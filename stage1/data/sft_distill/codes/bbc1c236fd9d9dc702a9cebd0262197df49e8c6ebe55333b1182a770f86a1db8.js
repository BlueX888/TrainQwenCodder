class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDeathCount = 0;
    this.particleEffectCount = 0;
  }

  preload() {
    // 创建灰色敌人纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('enemy', 40, 40);
    graphics.destroy();

    // 创建粒子纹理（红色小方块）
    const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    particleGraphics.fillStyle(0xff4444, 1);
    particleGraphics.fillRect(0, 0, 8, 8);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }

  create() {
    // 创建灰色敌人
    this.enemy = this.add.sprite(400, 300, 'enemy');
    this.enemy.setOrigin(0.5);

    // 创建粒子发射器
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 4000, // 4秒生命周期
      gravityY: 0,
      quantity: 10,
      frequency: -1, // 手动触发，不自动发射
      blendMode: 'ADD'
    });

    // 停止自动发射
    this.particleEmitter.stop();

    // 添加说明文本
    this.add.text(20, 20, '按空格键触发敌人死亡和粒子爆炸', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 状态显示
    this.statusText = this.add.text(20, 50, '', {
      fontSize: '16px',
      fill: '#00ff00'
    });
    this.updateStatusText();

    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.triggerEnemyDeath();
    });

    // 添加提示文本
    this.hintText = this.add.text(400, 500, '敌人位置: (400, 300)', {
      fontSize: '14px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  triggerEnemyDeath() {
    if (!this.enemy.visible) {
      // 如果敌人已经死亡，重置敌人
      this.enemy.setVisible(true);
      this.enemy.setPosition(400, 300);
      return;
    }

    // 记录死亡
    this.enemyDeathCount++;
    this.particleEffectCount++;

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(this.enemy.x, this.enemy.y);
    this.particleEmitter.explode(10); // 一次性发射10个粒子

    // 隐藏敌人
    this.enemy.setVisible(false);

    // 更新状态文本
    this.updateStatusText();

    // 4秒后显示提示
    this.time.delayedCall(4000, () => {
      if (!this.enemy.visible) {
        this.hintText.setText('粒子效果已结束，再次按空格重置敌人');
      }
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `敌人死亡次数: ${this.enemyDeathCount}\n` +
      `粒子效果触发次数: ${this.particleEffectCount}`
    );
  }

  update(time, delta) {
    // 更新提示文本
    if (this.enemy.visible) {
      this.hintText.setText('敌人位置: (400, 300) - 按空格触发死亡');
    }
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