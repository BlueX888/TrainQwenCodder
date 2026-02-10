class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.enemiesRemaining = 0;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      level: 1,
      enemiesKilled: 0,
      enemiesRemaining: 0,
      gameCompleted: false,
      levelHistory: []
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel(1);
  }

  startLevel(level) {
    this.currentLevel = level;
    
    // 计算敌人数量：第1关3个，每关+2个
    this.enemiesPerLevel = 3 + (level - 1) * 2;
    this.enemiesRemaining = this.enemiesPerLevel;

    // 更新signals
    window.__signals__.level = level;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子保证确定性）
    const seed = level * 1000;
    for (let i = 0; i < this.enemiesPerLevel; i++) {
      // 伪随机位置（确定性）
      const x = 100 + ((seed + i * 137) % 600);
      const y = 50 + ((seed + i * 211) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 200) - 100,
        ((seed + i * 97) % 100) + 20
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();

    // 显示关卡开始提示
    this.statusText.setText(`Level ${level}\nStart!`);
    this.statusText.setVisible(true);
    
    this.time.delayedCall(1500, () => {
      this.statusText.setVisible(false);
    });

    console.log(`Level ${level} started with ${this.enemiesPerLevel} enemies`);
  }

  shoot() {
    if (!this.canShoot) return;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(300, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.destroy();
    
    // 更新计数
    this.enemiesRemaining--;
    this.totalEnemiesKilled++;

    // 更新signals
    window.__signals__.enemiesKilled = this.totalEnemiesKilled;
    window.__signals__.enemiesRemaining = this.enemiesRemaining;

    console.log(`Enemy killed! Remaining: ${this.enemiesRemaining}`);

    // 检查是否清空所有敌人
    if (this.enemiesRemaining <= 0) {
      this.levelComplete();
    }

    this.updateUI();
  }

  levelComplete() {
    // 记录关卡历史
    window.__signals__.levelHistory.push({
      level: this.currentLevel,
      enemiesKilled: this.enemiesPerLevel,
      timestamp: Date.now()
    });

    console.log(`Level ${this.currentLevel} completed!`);

    if (this.currentLevel >= this.maxLevel) {
      // 游戏完成
      this.gameComplete();
    } else {
      // 进入下一关
      this.statusText.setText(`Level ${this.currentLevel}\nComplete!`);
      this.statusText.setVisible(true);

      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    }
  }

  gameComplete() {
    window.__signals__.gameCompleted = true;
    
    this.statusText.setText(`All Levels\nCompleted!\n\nTotal Kills: ${this.totalEnemiesKilled}`);
    this.statusText.setVisible(true);

    // 停止游戏逻辑
    this.physics.pause();
    
    console.log('Game completed! Total enemies killed:', this.totalEnemiesKilled);
    console.log('Final signals:', JSON.stringify(window.__signals__, null, 2));
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyText.setText(`Enemies: ${this.enemiesRemaining}/${this.enemiesPerLevel}`);
  }

  update(time, delta) {
    // 玩家移动
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

    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shoot();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.each((bullet) => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
      }
    });
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
  scene: GameScene
};

const game = new Phaser.Game(config);