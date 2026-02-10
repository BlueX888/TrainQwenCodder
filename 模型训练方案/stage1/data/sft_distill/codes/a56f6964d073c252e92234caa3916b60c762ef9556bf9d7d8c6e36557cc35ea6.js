// 游戏状态信号
window.__signals__ = {
  gameOver: false,
  survivalTime: 0,
  enemyCount: 20,
  playerPosition: { x: 0, y: 0 },
  collisionCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.startTime = 0;
    this.gameOverFlag = false;
    this.playerSpeed = 200;
    this.enemySpeed = 80;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 记录开始时间
    this.startTime = this.time.now;

    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成 20 个敌人，随机分布在场景边缘
    for (let i = 0; i < 20; i++) {
      let x, y;
      const side = Phaser.Math.Between(0, 3);
      
      switch(side) {
        case 0: // 上边
          x = Phaser.Math.Between(0, 800);
          y = Phaser.Math.Between(0, 100);
          break;
        case 1: // 右边
          x = Phaser.Math.Between(700, 800);
          y = Phaser.Math.Between(0, 600);
          break;
        case 2: // 下边
          x = Phaser.Math.Between(0, 800);
          y = Phaser.Math.Between(500, 600);
          break;
        case 3: // 左边
          x = Phaser.Math.Between(0, 100);
          y = Phaser.Math.Between(0, 600);
          break;
      }

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.5);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加游戏说明文本
    this.add.text(10, 10, 'Use Arrow Keys to Move\nAvoid Red Enemies!', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }).setScrollFactor(0).setDepth(100);

    // 存活时间文本
    this.survivalText = this.add.text(10, 80, 'Time: 0s', {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(100);

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      enemyCount: 20,
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed
    }));
  }

  update(time, delta) {
    if (this.gameOverFlag) {
      return;
    }

    // 更新存活时间
    const survivalTime = Math.floor((time - this.startTime) / 1000);
    window.__signals__.survivalTime = survivalTime;
    this.survivalText.setText(`Time: ${survivalTime}s`);

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

    // 更新玩家位置信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 敌人追踪玩家
    this.enemies.getChildren().forEach((enemy) => {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
    });

    // 每秒输出一次状态日志
    if (survivalTime > 0 && survivalTime % 5 === 0 && time - this.startTime < survivalTime * 1000 + 100) {
      console.log(JSON.stringify({
        event: 'status_update',
        timestamp: Date.now(),
        survivalTime: survivalTime,
        playerPosition: window.__signals__.playerPosition,
        gameOver: false
      }));
    }
  }

  hitEnemy(player, enemy) {
    if (this.gameOverFlag) {
      return;
    }

    this.gameOverFlag = true;
    window.__signals__.gameOver = true;
    window.__signals__.collisionCount++;

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红表示被击中
    player.setTint(0xff0000);

    // 显示游戏结束文本
    const survivalTime = Math.floor((this.time.now - this.startTime) / 1000);
    this.add.text(400, 300, `GAME OVER!\nSurvived: ${survivalTime}s\n\nPress F5 to Restart`, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      padding: { x: 20, y: 20 },
      align: 'center'
    }).setOrigin(0.5).setDepth(200);

    console.log(JSON.stringify({
      event: 'game_over',
      timestamp: Date.now(),
      survivalTime: survivalTime,
      finalPosition: window.__signals__.playerPosition,
      collisionCount: window.__signals__.collisionCount
    }));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);