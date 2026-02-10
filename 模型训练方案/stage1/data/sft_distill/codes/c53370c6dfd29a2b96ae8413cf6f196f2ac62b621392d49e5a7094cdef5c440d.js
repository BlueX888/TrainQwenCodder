class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.survivalTime = 0;
    this.collisionCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      gameOver: false,
      survivalTime: 0,
      collisionCount: 0,
      playerPosition: { x: 0, y: 0 },
      enemyCount: 5
    };

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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200, 200);
    this.player.setDrag(800, 800);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在随机位置创建5个敌人
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 50 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(16, 50, 'Status: Playing', {
      fontSize: '20px',
      fill: '#0f0'
    });

    this.collisionText = this.add.text(16, 80, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ff0'
    });

    // 添加说明文本
    this.add.text(400, 16, 'Use Arrow Keys to Dodge Enemies!', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5, 0);

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      playerPosition: { x: 400, y: 300 },
      enemyCount: 5
    }));
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.collisionCount++;
    this.gameOver = true;

    // 更新状态信号
    window.__signals__.gameOver = true;
    window.__signals__.collisionCount = this.collisionCount;

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红表示被击中
    this.player.setTint(0xff0000);

    this.statusText.setText('Status: Game Over!');
    this.statusText.setColor('#f00');

    console.log(JSON.stringify({
      event: 'game_over',
      timestamp: Date.now(),
      survivalTime: this.survivalTime,
      collisionCount: this.collisionCount,
      finalPosition: {
        x: Math.round(player.x),
        y: Math.round(player.y)
      }
    }));

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新存活时间
    this.survivalTime += delta;
    const seconds = Math.floor(this.survivalTime / 1000);
    this.timeText.setText(`Time: ${seconds}s`);

    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 玩家移动控制
    const acceleration = 600;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 120);
    });

    // 更新状态信号
    window.__signals__.survivalTime = Math.floor(this.survivalTime / 1000);
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 每5秒输出一次状态日志
    if (seconds > 0 && seconds % 5 === 0 && this.survivalTime % 1000 < delta) {
      console.log(JSON.stringify({
        event: 'status_update',
        timestamp: Date.now(),
        survivalTime: seconds,
        playerPosition: window.__signals__.playerPosition,
        enemyCount: this.enemies.children.entries.length
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