class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.playerSpeed = 300 * 1.2; // 360
    this.enemySpeed = 300;
    this.gameState = {
      playerCaught: false,
      distanceToEnemy: 0,
      playerX: 0,
      playerY: 0,
      enemyX: 0,
      enemyY: 0,
      elapsedTime: 0
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemyTex', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemyTex');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 添加提示文本
    this.add.text(10, 10, 'Arrow Keys to Move\nPlayer Speed: 360\nEnemy Speed: 300', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 距离显示文本
    this.distanceText = this.add.text(10, 80, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 初始化状态信号
    window.__signals__ = this.gameState;
  }

  update(time, delta) {
    // 更新经过时间
    this.gameState.elapsedTime = time;

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
    if (!this.gameState.playerCaught) {
      this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);
    } else {
      this.enemy.setVelocity(0);
    }

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新状态信号
    this.gameState.distanceToEnemy = Math.round(distance);
    this.gameState.playerX = Math.round(this.player.x);
    this.gameState.playerY = Math.round(this.player.y);
    this.gameState.enemyX = Math.round(this.enemy.x);
    this.gameState.enemyY = Math.round(this.enemy.y);

    // 更新距离显示
    this.distanceText.setText(
      `Distance: ${this.gameState.distanceToEnemy}px\n` +
      `Player: (${this.gameState.playerX}, ${this.gameState.playerY})\n` +
      `Enemy: (${this.gameState.enemyX}, ${this.gameState.enemyY})\n` +
      `Status: ${this.gameState.playerCaught ? 'CAUGHT!' : 'Running'}`
    );

    // 输出日志（每秒一次）
    if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
      console.log(JSON.stringify({
        type: 'game_state',
        time: Math.floor(time / 1000),
        distance: this.gameState.distanceToEnemy,
        caught: this.gameState.playerCaught,
        playerPos: { x: this.gameState.playerX, y: this.gameState.playerY },
        enemyPos: { x: this.gameState.enemyX, y: this.gameState.enemyY }
      }));
    }
  }

  onCatch(player, enemy) {
    if (!this.gameState.playerCaught) {
      this.gameState.playerCaught = true;
      
      // 视觉反馈
      player.setTint(0xff0000);
      
      // 输出捕获事件
      console.log(JSON.stringify({
        type: 'player_caught',
        time: this.gameState.elapsedTime,
        position: { x: this.gameState.playerX, y: this.gameState.playerY }
      }));

      // 显示游戏结束文本
      this.add.text(400, 300, 'CAUGHT!', {
        fontSize: '48px',
        fill: '#ff0000'
      }).setOrigin(0.5);

      // 3秒后重启
      this.time.delayedCall(3000, () => {
        this.scene.restart();
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