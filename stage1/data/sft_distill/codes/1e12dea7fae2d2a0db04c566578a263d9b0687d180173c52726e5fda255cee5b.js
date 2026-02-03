class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.remainingEnemies = 0;
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);

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

    // 键盘输入
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
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 46, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 76, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    this.currentLevel = level;
    
    // 计算敌人数量：第 1 关 3 个，每关增加 2 个
    this.enemiesPerLevel = 3 + (level - 1) * 2;
    this.remainingEnemies = this.enemiesPerLevel;

    // 清空现有敌人和子弹
    this.enemies.clear(true, true);
    this.bullets.clear(true, true);

    // 生成敌人（使用固定种子保证确定性）
    const seed = level * 1000;
    for (let i = 0; i < this.enemiesPerLevel; i++) {
      // 使用伪随机生成确定性位置
      const x = 100 + ((seed + i * 137) % 600);
      const y = 50 + ((seed + i * 271) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 173) % 100) - 50,
        ((seed + i * 211) % 50) + 20
      );
      enemy.setBounce(1, 1);
      enemy.setCollideWorldBounds(true);
    }

    // 显示关卡开始信息
    this.statusText.setText(`Level ${level} Start!`);
    this.statusText.setVisible(true);
    
    this.time.delayedCall(2000, () => {
      this.statusText.setVisible(false);
    });

    this.updateUI();
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
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      this.time.delayedCall(this.shootDelay, () => {
        this.canShoot = true;
      });
    }

    // 子弹移动和清理
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.y < 0) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 检查关卡完成
    if (this.remainingEnemies === 0 && this.enemies.countActive() === 0) {
      this.levelComplete();
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.remainingEnemies--;
    this.score += 10;
    this.updateUI();
  }

  levelComplete() {
    if (this.currentLevel < this.maxLevel) {
      this.statusText.setText(`Level ${this.currentLevel} Complete!\nNext Level in 2s...`);
      this.statusText.setVisible(true);
      
      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    } else {
      // 游戏完成
      this.statusText.setText(`All Levels Complete!\nFinal Score: ${this.score}`);
      this.statusText.setVisible(true);
      this.physics.pause();
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.enemiesPerLevel}`);
    this.scoreText.setText(`Score: ${this.score}`);
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