class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 状态信号：存活时间
    this.distanceToEnemy = 0; // 状态信号：与敌人的距离
    this.isGameOver = false; // 状态信号：游戏是否结束
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（白色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（随机位置，远离玩家）
    const enemyX = Phaser.Math.Between(0, 1) === 0 ? 100 : 700;
    const enemyY = Phaser.Math.Between(0, 1) === 0 ? 100 : 500;
    this.enemy = this.physics.add.sprite(enemyX, enemyY, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCollision, null, this);

    // 创建文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);

    // 添加提示文本
    this.add.text(400, 550, '使用方向键移动 | 玩家速度: 360 | 敌人速度: 300', {
      fontSize: '16px',
      fill: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;

    // 玩家移动控制（速度 300 * 1.2 = 360）
    const playerSpeed = 300 * 1.2;
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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度 300）
    const enemySpeed = 300;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算与敌人的距离
    this.distanceToEnemy = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新状态显示
    this.statusText.setText([
      `存活时间: ${(this.survivalTime / 1000).toFixed(1)}s`,
      `与敌人距离: ${this.distanceToEnemy.toFixed(0)}px`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `敌人位置: (${Math.floor(this.enemy.x)}, ${Math.floor(this.enemy.y)})`
    ]);
  }

  onCollision(player, enemy) {
    // 游戏结束
    this.isGameOver = true;
    
    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 显示游戏结束信息
    this.gameOverText.setText([
      '游戏结束！',
      `存活时间: ${(this.survivalTime / 1000).toFixed(1)}秒`
    ]);

    // 控制台输出状态信号
    console.log('=== 游戏结束状态 ===');
    console.log('存活时间:', (this.survivalTime / 1000).toFixed(1), '秒');
    console.log('最终距离:', this.distanceToEnemy.toFixed(0), 'px');
    console.log('玩家最终位置:', Math.floor(this.player.x), Math.floor(this.player.y));
    console.log('敌人最终位置:', Math.floor(this.enemy.x), Math.floor(this.enemy.y));

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
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