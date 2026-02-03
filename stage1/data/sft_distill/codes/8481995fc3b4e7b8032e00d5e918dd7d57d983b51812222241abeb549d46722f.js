class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.collisionCount = 0;
    this.gameActive = true;
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

    // 生成敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(400, 550, '使用方向键移动 | 玩家速度: 360 | 敌人速度: 300', {
      fontSize: '14px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (!this.gameActive) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);

    // 玩家移动控制（速度 300 * 1.2 = 360）
    const playerSpeed = 360;
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

    // 更新状态文本
    this.updateStatusText();
  }

  handleCollision(player, enemy) {
    this.collisionCount++;
    
    // 碰撞后游戏结束
    this.gameActive = false;
    player.setTint(0xff0000);
    player.setVelocity(0);
    enemy.setVelocity(0);

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, 'GAME OVER\n被敌人抓住了！', {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    }).setOrigin(0.5);

    // 显示重启提示
    this.time.delayedCall(1000, () => {
      this.add.text(400, 380, '点击刷新页面重新开始', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5);
    });
  }

  updateStatusText() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    this.statusText.setText([
      `存活时间: ${this.survivalTime}秒`,
      `碰撞次数: ${this.collisionCount}`,
      `距离敌人: ${Math.floor(distance)}px`,
      `状态: ${this.gameActive ? '进行中' : '已结束'}`
    ]);
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