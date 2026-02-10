// 游戏状态信号
window.__signals__ = {
  playerAlive: true,
  survivalTime: 0,
  enemyCount: 5,
  playerPosition: { x: 0, y: 0 },
  enemyPositions: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.startTime = 0;
    this.gameOver = false;
    this.playerSpeed = 200;
    this.enemySpeed = 160;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.startTime = this.time.now;

    // 创建玩家纹理（绿色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建5个敌人
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

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(16, 16, 'Use Arrow Keys to Move\nAvoid Red Enemies!', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 添加存活时间显示
    this.timeText = this.add.text(16, 80, 'Time: 0s', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      playerPosition: { x: 400, y: 300 },
      enemyCount: 5
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    const survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText(`Time: ${survivalTime}s`);

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

    // 每个敌人追踪玩家
    const enemyPositions = [];
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      enemyPositions.push({ x: Math.floor(enemy.x), y: Math.floor(enemy.y) });
    });

    // 更新游戏状态信号
    window.__signals__.survivalTime = survivalTime;
    window.__signals__.playerPosition = {
      x: Math.floor(this.player.x),
      y: Math.floor(this.player.y)
    };
    window.__signals__.enemyPositions = enemyPositions;
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    window.__signals__.playerAlive = false;

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变色表示死亡
    player.setTint(0xff0000);

    // 显示游戏结束文本
    const survivalTime = Math.floor((this.time.now - this.startTime) / 1000);
    this.add.text(400, 300, `GAME OVER!\nSurvived: ${survivalTime}s\nClick to Restart`, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 },
      align: 'center'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_over',
      timestamp: Date.now(),
      survivalTime: survivalTime,
      finalPosition: { x: Math.floor(player.x), y: Math.floor(player.y) }
    }));

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
      window.__signals__.playerAlive = true;
      window.__signals__.survivalTime = 0;
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