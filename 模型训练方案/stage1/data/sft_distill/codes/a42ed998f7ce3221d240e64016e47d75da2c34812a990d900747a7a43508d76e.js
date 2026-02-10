class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isCaught = false; // 状态信号：是否被抓住
    this.survivalTime = 0; // 状态信号：存活时间
    this.distance = 0; // 状态信号：与敌人的距离
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

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD控制
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys or WASD to move. Escape the purple enemy!', {
      fontSize: '14px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    console.log('Game Started - Player speed: 360, Enemy speed: 300');
  }

  update(time, delta) {
    if (this.isCaught) {
      return; // 如果被抓住，停止更新
    }

    // 更新存活时间
    this.survivalTime += delta;

    // 重置玩家速度
    this.player.setVelocity(0);

    const playerSpeed = 300 * 1.2; // 360

    // 处理玩家移动（方向键）
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家
    const enemySpeed = 300;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算距离
    this.distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新信息显示
    this.updateInfo();
  }

  onCatch() {
    if (!this.isCaught) {
      this.isCaught = true;
      
      // 停止所有移动
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);

      // 显示游戏结束信息
      const gameOverText = this.add.text(400, 300, 'CAUGHT!', {
        fontSize: '64px',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      const survivalSeconds = (this.survivalTime / 1000).toFixed(2);
      this.add.text(400, 370, `You survived for ${survivalSeconds} seconds`, {
        fontSize: '24px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      console.log(`Game Over - Caught after ${survivalSeconds} seconds`);
    }
  }

  updateInfo() {
    const survivalSeconds = (this.survivalTime / 1000).toFixed(1);
    const distanceRounded = Math.round(this.distance);
    
    this.infoText.setText([
      `Survival Time: ${survivalSeconds}s`,
      `Distance to Enemy: ${distanceRounded}`,
      `Status: ${this.isCaught ? 'CAUGHT' : 'ESCAPING'}`,
      `Player Speed: 360 | Enemy Speed: 300`
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