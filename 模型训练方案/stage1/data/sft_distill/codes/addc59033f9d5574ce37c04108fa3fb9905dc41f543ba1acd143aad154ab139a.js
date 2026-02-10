class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.distanceFromEnemy = 0;
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9933ff, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人精灵（随机边缘位置）
    const spawnX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
    const spawnY = Phaser.Math.Between(100, 500);
    this.enemy = this.physics.add.sprite(spawnX, spawnY, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建UI文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(400, 550, '使用方向键或WASD移动 | 玩家速度: 192 | 敌人速度: 160', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = ((time - this.startTime) / 1000).toFixed(1);

    // 计算与敌人的距离
    this.distanceFromEnemy = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    ).toFixed(0);

    // 玩家移动控制（速度 160 * 1.2 = 192）
    const playerSpeed = 192;
    this.player.setVelocity(0);

    let moving = false;
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
      moving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
      moving = true;
    }

    // 对角线移动时归一化速度
    if (moving && this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 160）
    const enemySpeed = 160;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 更新状态文本
    this.statusText.setText([
      `存活时间: ${this.survivalTime}秒`,
      `与敌人距离: ${this.distanceFromEnemy}像素`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `敌人位置: (${Math.floor(this.enemy.x)}, ${Math.floor(this.enemy.y)})`
    ]);
  }

  handleCollision(player, enemy) {
    if (this.gameOver) return;
    
    this.gameOver = true;
    
    // 停止所有移动
    player.setVelocity(0);
    enemy.setVelocity(0);

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, [
      '游戏结束！',
      `存活时间: ${this.survivalTime}秒`,
      '',
      '按 R 键重新开始'
    ], {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 15 },
      align: 'center'
    }).setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });

    console.log('游戏结束 - 存活时间:', this.survivalTime, '秒');
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