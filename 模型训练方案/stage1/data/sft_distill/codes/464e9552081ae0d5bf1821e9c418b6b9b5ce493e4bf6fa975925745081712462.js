class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.gameOver = false;
    this.score = 0;
    this.startTime = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      gameOver: false,
      score: 0,
      collisionCount: 0,
      enemiesSpawned: 0
    };

    this.gameOver = false;
    this.startTime = this.time.now;

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成敌人（每1秒生成一个）
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
  }

  spawnEnemy() {
    if (this.gameOver) return;

    // 在屏幕顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下移动速度为80
    enemy.setVelocityY(80);
    enemy.body.setSize(30, 30);

    // 更新信号
    window.__signals__.enemiesSpawned++;

    console.log(JSON.stringify({
      event: 'enemySpawned',
      position: { x, y: -30 },
      velocity: 80,
      totalSpawned: window.__signals__.enemiesSpawned
    }));
  }

  handleCollision(player, enemy) {
    if (this.gameOver) return;

    // 游戏结束
    this.gameOver = true;
    this.gameOverText.setVisible(true);

    // 停止玩家和所有敌人
    this.player.setVelocity(0, 0);
    this.enemies.children.entries.forEach(e => e.setVelocity(0, 0));

    // 停止生成敌人
    this.enemyTimer.remove();

    // 更新最终分数
    this.score = Math.floor((this.time.now - this.startTime) / 1000);

    // 更新信号
    window.__signals__.gameOver = true;
    window.__signals__.score = this.score;
    window.__signals__.collisionCount++;

    console.log(JSON.stringify({
      event: 'gameOver',
      finalScore: this.score,
      enemiesSpawned: window.__signals__.enemiesSpawned,
      collisionCount: window.__signals__.collisionCount
    }));
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家左右移动控制
    const moveSpeed = 300;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(moveSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新分数（存活时间）
    this.score = Math.floor((time - this.startTime) / 1000);
    this.scoreText.setText('Time: ' + this.score + 's');
    window.__signals__.score = this.score;

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DodgeGameScene
};

new Phaser.Game(config);