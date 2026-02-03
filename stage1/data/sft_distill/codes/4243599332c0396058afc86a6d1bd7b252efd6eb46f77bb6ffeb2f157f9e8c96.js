// 游戏状态信号
window.__signals__ = {
  playerAlive: true,
  enemyDistance: 0,
  gameTime: 0,
  collisionCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（随机位置）
    const startX = Phaser.Math.Between(100, 700);
    const startY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 添加提示文本
    this.add.text(10, 10, 'Arrow Keys: Move (Speed 288)', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.add.text(10, 30, 'Green: Player | Cyan: Enemy (Speed 240)', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.distanceText = this.add.text(10, 50, '', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.collisionText = this.add.text(10, 70, 'Collisions: 0', {
      fontSize: '16px',
      fill: '#ff0000'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      playerPos: { x: this.player.x, y: this.player.y },
      enemyPos: { x: this.enemy.x, y: this.enemy.y }
    }));
  }

  update(time, delta) {
    if (!this.player || !this.enemy) return;

    // 玩家移动控制（速度 240 * 1.2 = 288）
    const playerSpeed = 240 * 1.2;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 240）
    this.physics.moveToObject(this.enemy, this.player, 240);

    // 计算距离并更新信号
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    window.__signals__.enemyDistance = Math.round(distance);
    window.__signals__.gameTime = Math.round(time / 1000);
    window.__signals__.collisionCount = this.collisionCount;

    // 更新距离显示
    this.distanceText.setText(`Distance: ${Math.round(distance)}px`);
  }

  handleCollision(player, enemy) {
    // 碰撞处理
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 将敌人重置到随机位置
    const newX = Phaser.Math.Between(100, 700);
    const newY = Phaser.Math.Between(100, 500);
    enemy.setPosition(newX, newY);

    // 输出碰撞日志
    console.log(JSON.stringify({
      event: 'collision',
      count: this.collisionCount,
      time: this.time.now,
      playerPos: { x: Math.round(player.x), y: Math.round(player.y) },
      enemyNewPos: { x: newX, y: newY }
    }));

    // 闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);