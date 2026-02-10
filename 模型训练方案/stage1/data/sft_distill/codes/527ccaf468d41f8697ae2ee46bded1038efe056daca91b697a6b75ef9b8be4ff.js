class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.playerSpeed = 120 * 1.2; // 144
    this.enemySpeed = 120;
    this.gameState = {
      playerCaught: false,
      distance: 0,
      gameTime: 0,
      playerMoves: 0
    };
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家（初始位置在中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（初始位置在左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号对象
    window.__signals__ = {
      playerPosition: { x: 400, y: 300 },
      enemyPosition: { x: 100, y: 100 },
      distance: 0,
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      playerCaught: false,
      gameTime: 0,
      playerMoves: 0
    };

    console.log(JSON.stringify({
      type: 'GAME_START',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.gameState.playerCaught) {
      return;
    }

    this.gameState.gameTime += delta;

    // 玩家移动控制
    this.player.setVelocity(0);

    let isMoving = false;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
      isMoving = true;
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    if (isMoving) {
      this.gameState.playerMoves++;
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );
    this.gameState.distance = distance;

    // 更新信息显示
    this.infoText.setText([
      `Player Speed: ${this.playerSpeed}`,
      `Enemy Speed: ${this.enemySpeed}`,
      `Distance: ${distance.toFixed(1)}`,
      `Time: ${(this.gameState.gameTime / 1000).toFixed(1)}s`,
      `Use Arrow Keys to Move`,
      `Status: ${this.gameState.playerCaught ? 'CAUGHT!' : 'ESCAPING'}`
    ]);

    // 更新全局信号
    window.__signals__.playerPosition = { x: this.player.x, y: this.player.y };
    window.__signals__.enemyPosition = { x: this.enemy.x, y: this.enemy.y };
    window.__signals__.distance = distance;
    window.__signals__.gameTime = this.gameState.gameTime;
    window.__signals__.playerMoves = this.gameState.playerMoves;
    window.__signals__.playerCaught = this.gameState.playerCaught;

    // 每秒记录一次状态日志
    if (Math.floor(this.gameState.gameTime / 1000) > Math.floor((this.gameState.gameTime - delta) / 1000)) {
      console.log(JSON.stringify({
        type: 'GAME_STATE',
        distance: distance.toFixed(1),
        gameTime: (this.gameState.gameTime / 1000).toFixed(1),
        playerPos: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        enemyPos: { x: Math.round(this.enemy.x), y: Math.round(this.enemy.y) },
        timestamp: Date.now()
      }));
    }
  }

  onCatch() {
    if (!this.gameState.playerCaught) {
      this.gameState.playerCaught = true;
      window.__signals__.playerCaught = true;

      // 停止敌人移动
      this.enemy.setVelocity(0);
      this.player.setVelocity(0);

      // 显示捕获信息
      const catchText = this.add.text(400, 300, 'CAUGHT!', {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      });
      catchText.setOrigin(0.5);

      console.log(JSON.stringify({
        type: 'PLAYER_CAUGHT',
        gameTime: (this.gameState.gameTime / 1000).toFixed(1),
        playerMoves: this.gameState.playerMoves,
        timestamp: Date.now()
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