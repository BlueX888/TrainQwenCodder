class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 80 * 1.2; // 96
    this.enemySpeed = 80;
    this.collisionCount = 0;
    this.gameTime = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
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
    this.physics.add.overlap(this.player, this.enemy, this.onCollision, null, this);

    // 添加显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号对象
    window.__signals__ = {
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      collisionCount: 0,
      distance: 0,
      gameTime: 0,
      playerPosition: { x: 400, y: 300 },
      enemyPosition: { x: 100, y: 100 },
      events: []
    };

    console.log(JSON.stringify({
      type: 'GAME_START',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      timestamp: 0
    }));
  }

  onCollision(player, enemy) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    
    const eventData = {
      type: 'COLLISION',
      count: this.collisionCount,
      position: { x: player.x, y: player.y },
      timestamp: this.gameTime
    };
    
    window.__signals__.events.push(eventData);
    console.log(JSON.stringify(eventData));

    // 碰撞后将敌人重置到随机位置
    this.enemy.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );
  }

  update(time, delta) {
    this.gameTime += delta;
    window.__signals__.gameTime = Math.floor(this.gameTime);

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

    // 更新信号
    window.__signals__.distance = Math.floor(distance);
    window.__signals__.playerPosition = { 
      x: Math.floor(this.player.x), 
      y: Math.floor(this.player.y) 
    };
    window.__signals__.enemyPosition = { 
      x: Math.floor(this.enemy.x), 
      y: Math.floor(this.enemy.y) 
    };

    // 更新显示文本
    this.infoText.setText([
      `Player Speed: ${this.playerSpeed}`,
      `Enemy Speed: ${this.enemySpeed}`,
      `Distance: ${Math.floor(distance)}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(this.gameTime / 1000)}s`,
      '',
      'Use Arrow Keys to Move',
      'Player (Green) Speed: 96',
      'Enemy (Blue) Speed: 80'
    ]);

    // 每秒输出一次状态日志
    if (Math.floor(this.gameTime / 1000) !== Math.floor((this.gameTime - delta) / 1000)) {
      console.log(JSON.stringify({
        type: 'STATUS',
        distance: Math.floor(distance),
        collisions: this.collisionCount,
        time: Math.floor(this.gameTime / 1000),
        timestamp: this.gameTime
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