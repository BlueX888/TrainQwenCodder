class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.playerSpeed = 120 * 1.2; // 144
    this.enemySpeed = 120;
    
    // 可验证的状态信号
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      enemyPosition: { x: 0, y: 0 },
      distance: 0,
      caught: false,
      catchCount: 0,
      gameTime: 0
    };
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

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
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

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 添加提示文字
    this.add.text(10, 10, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(10, 30, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    console.log('[GAME_START]', JSON.stringify({
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      playerPos: { x: 400, y: 300 },
      enemyPos: { x: 100, y: 100 }
    }));
  }

  update(time, delta) {
    // 更新游戏时间
    window.__signals__.gameTime = time;

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

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    // 更新状态信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyPosition = {
      x: Math.round(this.enemy.x),
      y: Math.round(this.enemy.y)
    };
    window.__signals__.distance = Math.round(distance);

    // 更新状态文字
    this.statusText.setText([
      `Distance: ${Math.round(distance)}`,
      `Caught: ${window.__signals__.catchCount} times`,
      `Player Speed: ${this.playerSpeed} | Enemy Speed: ${this.enemySpeed}`
    ]);

    // 每秒输出一次状态日志
    if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
      console.log('[GAME_STATE]', JSON.stringify({
        time: Math.floor(time / 1000),
        distance: Math.round(distance),
        playerPos: window.__signals__.playerPosition,
        enemyPos: window.__signals__.enemyPosition,
        catchCount: window.__signals__.catchCount
      }));
    }
  }

  onCatch(player, enemy) {
    // 只在未标记为caught时触发
    if (!window.__signals__.caught) {
      window.__signals__.caught = true;
      window.__signals__.catchCount++;

      // 闪烁效果
      this.tweens.add({
        targets: player,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          window.__signals__.caught = false;
        }
      });

      console.log('[CAUGHT]', JSON.stringify({
        catchCount: window.__signals__.catchCount,
        position: window.__signals__.playerPosition,
        time: window.__signals__.gameTime
      }));
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