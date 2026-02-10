class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0;
    this.particleEmitCount = 0;
  }

  preload() {
    // 使用Graphics创建纹理，避免外部资源依赖
  }

  create() {
    // 创建紫色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9933ff, 1); // 紫色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家纹理（绿色）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 30, 30);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    // 创建粒子纹理（红色小方块）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff6600, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建玩家（用于交互提示）
    this.player = this.add.sprite(100, 300, 'player');

    // 创建紫色敌人
    this.enemy = this.add.sprite(400, 300, 'enemy');
    this.enemy.setData('isAlive', true);

    // 创建粒子发射器（初始关闭）
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 3000,
      gravityY: 50,
      quantity: 10,
      frequency: -1, // 手动触发，不自动发射
      emitting: false
    });

    // 添加说明文字
    this.add.text(10, 10, 'Press SPACE to kill purple enemy', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 添加状态显示
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00'
    });
    this.updateStatusText();

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.killEnemy();
    });

    // 添加点击事件作为备选触发方式
    this.enemy.setInteractive();
    this.enemy.on('pointerdown', () => {
      this.killEnemy();
    });
  }

  killEnemy() {
    // 检查敌人是否还活着
    if (!this.enemy.getData('isAlive')) {
      return;
    }

    // 标记敌人已死亡
    this.enemy.setData('isAlive', false);

    // 在敌人位置触发粒子爆炸
    this.particleEmitter.setPosition(this.enemy.x, this.enemy.y);
    this.particleEmitter.explode(10); // 一次性发射10个粒子

    // 增加计数器
    this.killCount++;
    this.particleEmitCount++;

    // 更新状态文字
    this.updateStatusText();

    // 添加爆炸效果的视觉反馈
    this.tweens.add({
      targets: this.enemy,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.enemy.destroy();
        
        // 3秒后重新生成敌人用于测试
        this.time.delayedCall(3000, () => {
          this.respawnEnemy();
        });
      }
    });

    // 添加屏幕震动效果
    this.cameras.main.shake(200, 0.005);
  }

  respawnEnemy() {
    // 重新生成敌人
    const x = Phaser.Math.Between(200, 600);
    const y = Phaser.Math.Between(150, 450);
    
    this.enemy = this.add.sprite(x, y, 'enemy');
    this.enemy.setData('isAlive', true);
    this.enemy.setInteractive();
    this.enemy.on('pointerdown', () => {
      this.killEnemy();
    });

    // 添加出现动画
    this.enemy.setAlpha(0);
    this.enemy.setScale(0);
    this.tweens.add({
      targets: this.enemy,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `Kills: ${this.killCount} | Particle Explosions: ${this.particleEmitCount}`
    );
  }

  update(time, delta) {
    // 可以添加额外的更新逻辑
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