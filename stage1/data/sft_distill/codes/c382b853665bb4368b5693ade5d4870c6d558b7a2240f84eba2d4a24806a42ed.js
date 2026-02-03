// 完整的 Phaser3 躲避游戏代码
class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.gameOver = false;
    this.score = 0;
    this.survivalTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化游戏状态信号
    window.__signals__ = {
      gameOver: false,
      score: 0,
      survivalTime: 0,
      playerX: 400,
      playerY: 550,
      enemyCount: 0
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成敌人（每 1 秒生成一个）
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 添加分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加生存时间计时器
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.survivalTime += 0.1;
          this.score = Math.floor(this.survivalTime * 10);
          this.scoreText.setText(`Score: ${this.score}`);
          
          // 更新信号
          window.__signals__.score = this.score;
          window.__signals__.survivalTime = this.survivalTime;
        }
      },
      callbackScope: this,
      loop: true
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新玩家位置信号
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });

    // 更新敌人数量
    window.__signals__.enemyCount = this.enemies.countActive(true);
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(160); // 设置下落速度为 160
      enemy.body.setSize(30, 30);

      console.log(JSON.stringify({
        event: 'enemy_spawned',
        x: x,
        timestamp: Date.now()
      }));
    }
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 停止物理系统
    this.physics.pause();

    // 玩家变红表示游戏结束
    player.setTint(0xff0000);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    gameOverText.setOrigin(0.5);

    const finalScoreText = this.add.text(400, 370, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fill: '#ffffff'
    });
    finalScoreText.setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_over',
      finalScore: this.score,
      survivalTime: this.survivalTime,
      timestamp: Date.now()
    }));
  }
}

// 游戏配置
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
  scene: DodgeGameScene
};

// 创建游戏实例
new Phaser.Game(config);