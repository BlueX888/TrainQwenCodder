class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 80 * 1.2; // 96
    this.enemySpeed = 80;
    this.isCaught = false;
    this.survivalTime = 0;
    this.distance = 0;
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

    // 创建敌人精灵（随机位置，但距离玩家较远）
    const startX = Phaser.Math.Between(0, 1) === 0 ? 100 : 700;
    const startY = Phaser.Math.Between(0, 1) === 0 ? 100 : 500;
    this.enemy = this.physics.add.sprite(startX, startY, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCatch, null, this);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 560, 
      'Use Arrow Keys to move | Player Speed: 96 | Enemy Speed: 80', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 添加边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    if (this.isCaught) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta;

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
      const normalizedSpeed = this.playerSpeed / Math.sqrt(2);
      this.player.setVelocity(
        this.player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        this.player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新状态文本
    this.updateStatusText();
  }

  handleCatch(player, enemy) {
    if (!this.isCaught) {
      this.isCaught = true;
      
      // 停止所有移动
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);

      // 玩家变红表示被抓
      this.player.setTint(0xff0000);

      // 显示游戏结束信息
      const gameOverText = this.add.text(400, 300, 'CAUGHT!', {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      });
      gameOverText.setOrigin(0.5);

      this.updateStatusText();
    }
  }

  updateStatusText() {
    const survivalSeconds = (this.survivalTime / 1000).toFixed(1);
    const status = this.isCaught ? 'CAUGHT' : 'ESCAPING';
    
    this.statusText.setText([
      `Status: ${status}`,
      `Distance: ${Math.floor(this.distance)}px`,
      `Survival Time: ${survivalSeconds}s`,
      `Player Speed: ${this.playerSpeed}`,
      `Enemy Speed: ${this.enemySpeed}`
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