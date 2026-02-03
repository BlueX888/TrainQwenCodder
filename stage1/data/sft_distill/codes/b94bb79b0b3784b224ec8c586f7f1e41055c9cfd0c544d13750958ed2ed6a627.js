class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.score = 0;
    this.scoreText = null;
    this.gameOverText = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      gameOver: false,
      score: 0,
      playerX: 400,
      playerY: 550,
      enemiesCount: 0
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 定时生成敌人（每0.8秒）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启键
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });

    // 计分器（每秒加1分）
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.gameOver) {
          this.score += 1;
          this.scoreText.setText('Score: ' + this.score);
          window.__signals__.score = this.score;
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新信号
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;
    window.__signals__.enemiesCount = this.enemies.getChildren().length;

    // 清理超出屏幕的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机X位置（避免太靠边）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人速度为360（向下）
    enemy.setVelocityY(360);
    enemy.body.setSize(30, 30);
    
    // 确保敌人不会超出世界边界就消失
    enemy.setCollideWorldBounds(false);
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    
    // 停止物理系统
    this.physics.pause();
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 更新信号
    window.__signals__.gameOver = true;
    
    // 输出日志JSON
    console.log(JSON.stringify({
      event: 'gameOver',
      score: this.score,
      playerPosition: { x: player.x, y: player.y },
      enemiesCount: this.enemies.getChildren().length,
      timestamp: Date.now()
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: DodgeGame
};

new Phaser.Game(config);