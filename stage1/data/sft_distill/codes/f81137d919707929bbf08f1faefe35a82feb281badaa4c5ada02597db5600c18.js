class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.caughtCount = 0; // 状态信号：被抓次数
    this.escapeTime = 0; // 状态信号：逃脱时间（秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 120 * 1.2; // 144

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemySpeed = 120;

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCaught, null, this);

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示提示文本
    this.add.text(400, 550, '使用方向键或WASD移动 | 躲避黄色敌人！', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    console.log('游戏开始 - 玩家速度:', this.playerSpeed, '敌人速度:', this.enemySpeed);
  }

  update(time, delta) {
    // 更新逃脱时间
    this.escapeTime += delta / 1000;

    // 更新状态显示
    this.statusText.setText(
      `被抓次数: ${this.caughtCount} | 逃脱时间: ${this.escapeTime.toFixed(1)}秒`
    );

    // 玩家移动控制
    this.player.setVelocity(0);

    let moving = false;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -this.playerSpeed;
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = this.playerSpeed;
      moving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -this.playerSpeed;
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = this.playerSpeed;
      moving = true;
    }

    // 如果同时按下两个方向键，需要归一化速度向量
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2; // 归一化因子
      velocityX *= factor;
      velocityY *= factor;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);
  }

  onCaught(player, enemy) {
    // 被抓到时的处理
    this.caughtCount++;
    
    // 重置玩家位置到随机位置
    const randomX = Phaser.Math.Between(100, 700);
    const randomY = Phaser.Math.Between(100, 500);
    player.setPosition(randomX, randomY);
    
    // 重置敌人位置到对角
    enemy.setPosition(800 - randomX, 600 - randomY);
    
    // 停止移动
    player.setVelocity(0);
    enemy.setVelocity(0);

    console.log('被抓到！次数:', this.caughtCount);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);