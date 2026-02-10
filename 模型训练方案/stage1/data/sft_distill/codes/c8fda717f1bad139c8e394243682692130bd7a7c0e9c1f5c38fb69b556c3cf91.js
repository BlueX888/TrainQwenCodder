class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameState = 'playing'; // 状态信号：playing, caught
    this.distanceToEnemy = 0; // 距离信号
    this.survivalTime = 0; // 生存时间信号
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

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（起始位置在中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（起始位置在左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCaught, null, this);

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(10, 560, '使用方向键移动 | 玩家速度: 96 | 敌人速度: 80', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 初始化计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameState === 'playing') {
      // 玩家移动控制（速度 80 * 1.2 = 96）
      const playerSpeed = 96;
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

      // 敌人追踪玩家（速度 80）
      const enemySpeed = 80;
      this.physics.moveToObject(this.enemy, this.player, enemySpeed);

      // 计算距离
      this.distanceToEnemy = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.enemy.x,
        this.enemy.y
      );

      // 计算生存时间
      this.survivalTime = Math.floor((time - this.startTime) / 1000);

      // 更新状态显示
      this.statusText.setText([
        `状态: ${this.gameState}`,
        `距离敌人: ${Math.floor(this.distanceToEnemy)} px`,
        `生存时间: ${this.survivalTime} 秒`,
        `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
        `敌人位置: (${Math.floor(this.enemy.x)}, ${Math.floor(this.enemy.y)})`
      ]);
    } else if (this.gameState === 'caught') {
      // 被抓住后停止移动
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);
    }
  }

  onCaught() {
    if (this.gameState === 'playing') {
      this.gameState = 'caught';
      
      // 更新状态显示
      this.statusText.setText([
        `状态: ${this.gameState}`,
        `被抓住了！`,
        `生存时间: ${this.survivalTime} 秒`,
        `最终距离: ${Math.floor(this.distanceToEnemy)} px`,
        '',
        '刷新页面重新开始'
      ]);

      // 改变玩家颜色表示被抓住
      const caughtGraphics = this.add.graphics();
      caughtGraphics.fillStyle(0xff0000, 1);
      caughtGraphics.fillRect(0, 0, 32, 32);
      caughtGraphics.generateTexture('playerCaught', 32, 32);
      caughtGraphics.destroy();
      this.player.setTexture('playerCaught');

      console.log('游戏结束 - 状态信号:', {
        gameState: this.gameState,
        survivalTime: this.survivalTime,
        finalDistance: this.distanceToEnemy
      });
    }
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