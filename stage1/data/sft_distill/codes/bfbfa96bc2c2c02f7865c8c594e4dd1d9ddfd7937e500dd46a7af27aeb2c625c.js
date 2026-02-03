// 游戏主场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.score = 0;
    this.enemiesPerLevel = 3; // 第1关基础敌人数
    this.enemyIncrement = 2; // 每关增加的敌人数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      level: this.currentLevel,
      enemiesRemaining: 0,
      score: this.score,
      gameOver: false,
      victory: false
    };

    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 5, 10);
    bulletGraphics.generateTexture('bullet', 5, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;
    this.shootDelay = 250;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 84, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.enemiesPerLevel + (this.currentLevel - 1) * this.enemyIncrement;

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 250);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新 UI
    this.updateUI();

    // 显示关卡开始信息
    this.messageText.setText(`Level ${this.currentLevel}`);
    this.time.delayedCall(1500, () => {
      this.messageText.setText('');
    });

    // 更新信号
    window.__signals__.level = this.currentLevel;
    window.__signals__.enemiesRemaining = enemyCount;
    
    console.log(JSON.stringify({
      event: 'level_start',
      level: this.currentLevel,
      enemies: enemyCount,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    if (window.__signals__.gameOver || window.__signals__.victory) {
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

    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
    }

    // 清理离开屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查关卡完成
    if (this.enemies.countActive(true) === 0 && !this.messageText.text) {
      this.levelComplete();
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      this.canShoot = false;

      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 增加分数
    this.score += 10;

    // 更新 UI 和信号
    this.updateUI();
    window.__signals__.score = this.score;
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);

    console.log(JSON.stringify({
      event: 'enemy_destroyed',
      score: this.score,
      enemiesRemaining: this.enemies.countActive(true),
      timestamp: Date.now()
    }));
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.messageText.setText('VICTORY!\nAll Levels Complete!');
      window.__signals__.victory = true;
      
      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        timestamp: Date.now()
      }));
    } else {
      // 进入下一关
      this.currentLevel++;
      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!`);
      
      console.log(JSON.stringify({
        event: 'level_complete',
        level: this.currentLevel - 1,
        score: this.score,
        timestamp: Date.now()
      }));

      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}`);
    this.scoreText.setText(`Score: ${this.score}`);
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