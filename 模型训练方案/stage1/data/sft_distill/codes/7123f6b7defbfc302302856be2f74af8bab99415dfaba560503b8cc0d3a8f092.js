class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0;
    this.gameOver = false;
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
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      survivalTime: 0,
      gameOver: false,
      playerPosition: { x: 0, y: 0 },
      enemyDistances: [],
      collisionCount: 0
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800);
    this.player.setMaxVelocity(200);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在四周创建5个敌人
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 45, 'Status: Playing', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      playerPosition: { x: 400, y: 300 },
      enemyCount: 5,
      enemySpeed: 120
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    const seconds = Math.floor(this.survivalTime / 1000);
    this.timeText.setText(`Time: ${seconds}s`);

    // 玩家控制
    const acceleration = 400;
    
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
    const enemySpeed = 120;
    const enemyDistances = [];

    this.enemies.children.entries.forEach(enemy => {
      // 计算方向向量
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 设置速度
      this.physics.velocityFromRotation(angle, enemySpeed, enemy.body.velocity);

      // 计算距离
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );
      enemyDistances.push(Math.round(distance));
    });

    // 更新signals
    window.__signals__.survivalTime = seconds;
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyDistances = enemyDistances;
    window.__signals__.gameOver = this.gameOver;

    // 每秒输出一次日志
    if (seconds > 0 && seconds % 1 === 0 && this.survivalTime % 1000 < delta) {
      console.log(JSON.stringify({
        event: 'game_update',
        survivalTime: seconds,
        playerPosition: window.__signals__.playerPosition,
        minEnemyDistance: Math.min(...enemyDistances),
        avgEnemyDistance: Math.round(enemyDistances.reduce((a, b) => a + b, 0) / enemyDistances.length)
      }));
    }
  }

  handleCollision(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    window.__signals__.gameOver = true;
    window.__signals__.collisionCount++;

    // 停止所有物体
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.enemies.children.entries.forEach(e => {
      e.setVelocity(0, 0);
    });

    // 更新状态文本
    this.statusText.setText('Status: Game Over!');
    this.statusText.setColor('#ff0000');

    // 添加游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    const finalTime = Math.floor(this.survivalTime / 1000);
    const restartText = this.add.text(400, 370, `Survived: ${finalTime}s\nClick to restart`, {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    });
    restartText.setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_over',
      survivalTime: finalTime,
      finalPosition: {
        x: Math.round(player.x),
        y: Math.round(player.y)
      },
      collisionWith: {
        x: Math.round(enemy.x),
        y: Math.round(enemy.y)
      }
    }));

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
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