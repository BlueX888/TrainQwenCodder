class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 300 * 1.2; // 360
    this.enemySpeed = 300;
    this.caughtCount = 0; // 状态信号：被追到次数
    this.escapeTime = 0; // 状态信号：逃脱时间（秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（白色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（从随机位置开始）
    const startX = Phaser.Math.Between(100, 700);
    const startY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCaught, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 30, '使用方向键移动逃脱白色敌人', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 更新状态文本
    this.updateStatus();
  }

  update(time, delta) {
    // 更新逃脱时间
    this.escapeTime += delta / 1000;

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 更新状态显示
    this.updateStatus();
  }

  onCaught(player, enemy) {
    // 被追到时的处理
    this.caughtCount++;

    // 重置玩家位置到随机安全位置
    let safeX, safeY;
    do {
      safeX = Phaser.Math.Between(100, 700);
      safeY = Phaser.Math.Between(100, 500);
    } while (Phaser.Math.Distance.Between(safeX, safeY, enemy.x, enemy.y) < 150);

    player.setPosition(safeX, safeY);

    // 短暂闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    this.updateStatus();
  }

  updateStatus() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    this.statusText.setText([
      `被追到次数: ${this.caughtCount}`,
      `逃脱时间: ${this.escapeTime.toFixed(1)}秒`,
      `距离敌人: ${Math.floor(distance)}px`,
      `玩家速度: ${this.playerSpeed} | 敌人速度: ${this.enemySpeed}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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