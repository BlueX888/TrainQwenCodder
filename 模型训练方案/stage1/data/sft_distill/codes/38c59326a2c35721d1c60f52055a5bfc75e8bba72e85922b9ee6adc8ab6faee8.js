class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.isGameOver = false;
    this.startTime = 0;
    this.survivalTime = 0;
    this.enemiesAvoided = 0;
  }

  preload() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      gameStatus: 'playing',
      survivalTime: 0,
      enemiesAvoided: 0,
      playerX: 400,
      playerY: 550,
      enemyCount: 0
    };

    this.startTime = this.time.now;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 敌人生成定时器 - 每1.5秒生成一个敌人
    this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 添加游戏说明文本
    this.add.text(16, 16, '使用左右方向键移动\n躲避青色敌人', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 添加状态显示文本
    this.statusText = this.add.text(16, 70, '', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  spawnEnemy() {
    if (this.isGameOver) return;

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下移动速度为 80
    enemy.setVelocityY(80);
    enemy.body.setSize(30, 30);

    // 更新敌人计数
    window.__signals__.enemyCount = this.enemies.getChildren().length;

    console.log(JSON.stringify({
      event: 'enemy_spawn',
      x: x,
      enemyCount: window.__signals__.enemyCount,
      timestamp: Date.now()
    }));
  }

  handleCollision(player, enemy) {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.survivalTime = Math.floor((this.time.now - this.startTime) / 1000);

    // 停止玩家移动
    player.setVelocity(0, 0);
    player.setTint(0xff0000);

    // 停止所有敌人
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 更新信号
    window.__signals__.gameStatus = 'game_over';
    window.__signals__.survivalTime = this.survivalTime;
    window.__signals__.enemiesAvoided = this.enemiesAvoided;

    // 显示游戏结束文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(400, 370, `存活时间: ${this.survivalTime}秒\n躲避敌人: ${this.enemiesAvoided}个`, {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_over',
      survivalTime: this.survivalTime,
      enemiesAvoided: this.enemiesAvoided,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 玩家左右移动
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.y > 650) {
        this.enemiesAvoided++;
        enemy.destroy();
        console.log(JSON.stringify({
          event: 'enemy_avoided',
          enemiesAvoided: this.enemiesAvoided,
          timestamp: Date.now()
        }));
      }
    });

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);

    // 更新信号
    window.__signals__.survivalTime = this.survivalTime;
    window.__signals__.enemiesAvoided = this.enemiesAvoided;
    window.__signals__.playerX = Math.floor(this.player.x);
    window.__signals__.playerY = Math.floor(this.player.y);
    window.__signals__.enemyCount = this.enemies.getChildren().length;

    // 更新状态文本
    this.statusText.setText(
      `存活时间: ${this.survivalTime}秒\n` +
      `躲避敌人: ${this.enemiesAvoided}个\n` +
      `当前敌人: ${this.enemies.getChildren().length}个`
    );
  }
}

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
  scene: DodgeGameScene
};

const game = new Phaser.Game(config);