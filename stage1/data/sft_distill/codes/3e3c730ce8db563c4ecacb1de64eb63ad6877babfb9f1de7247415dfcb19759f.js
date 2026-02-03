class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.survivalTime = 0;
    this.gameOver = false;
    this.currentEnemySpeed = 120;
    this.speedIncreaseRate = 10; // 每秒增加的速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 速度显示文本
    this.speedText = this.add.text(16, 50, 'Enemy Speed: 120', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 重启提示文本
    this.restartText = this.add.text(400, 370, 'Press SPACE to restart', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 定时生成敌人
    this.enemyTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 记录游戏开始时间
    this.startTime = this.time.now;

    // 空格键重启
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText('Time: ' + this.survivalTime.toFixed(1) + 's');

    // 根据时间增加敌人速度
    this.currentEnemySpeed = 120 + (this.survivalTime * this.speedIncreaseRate);
    this.speedText.setText('Enemy Speed: ' + Math.floor(this.currentEnemySpeed));

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 移除超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 随机X位置生成敌人
    const x = Phaser.Math.Between(30, 770);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人速度（使用当前速度）
    enemy.setVelocityY(this.currentEnemySpeed);
  }

  hitEnemy(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    
    // 停止物理引擎
    this.physics.pause();
    
    // 停止敌人生成
    this.enemyTimer.remove();
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
    
    // 玩家变红
    this.player.setTint(0xff0000);
    
    // 输出最终统计
    console.log('Game Over! Survival Time:', this.survivalTime.toFixed(2), 's');
    console.log('Final Enemy Speed:', Math.floor(this.currentEnemySpeed));
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
  scene: DodgeGame
};

new Phaser.Game(config);