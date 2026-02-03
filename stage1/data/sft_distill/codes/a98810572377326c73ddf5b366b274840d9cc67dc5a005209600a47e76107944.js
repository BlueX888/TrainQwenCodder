// 全局信号记录
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 5,
  enemiesKilled: 0,
  score: 0,
  gameOver: false,
  victory: false,
  levelProgress: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.baseEnemies = 15;
    this.enemiesPerLevel = 2;
    this.score = 0;
    this.gameStarted = false;
  }

  preload() {
    // 创建玩家纹理（绿色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 5, 10);
    bulletGraphics.generateTexture('bullet', 5, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireDelay = 250; // 射击间隔

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemiesText = this.add.text(16, 46, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 76, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel(this.currentLevel);
    this.gameStarted = true;
  }

  startLevel(level) {
    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemies + (level - 1) * this.enemiesPerLevel;

    // 使用固定种子生成敌人位置
    const seed = level * 12345;
    let random = this.seededRandom(seed);

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 300;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (random() - 0.5) * 100,
        (random() - 0.5) * 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();

    // 记录关卡开始
    window.__signals__.levelProgress.push({
      level: level,
      enemyCount: enemyCount,
      startTime: Date.now()
    });
  }

  seededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  update(time, delta) {
    if (!this.gameStarted || window.__signals__.gameOver || window.__signals__.victory) {
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fire();
      this.lastFireTime = time;
    }

    // 更新子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查是否通关
    if (this.enemies.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  fire() {
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

    this.score += 10;
    window.__signals__.enemiesKilled++;
    window.__signals__.score = this.score;

    this.updateUI();
  }

  levelComplete() {
    if (this.currentLevel < this.totalLevels) {
      this.currentLevel++;
      window.__signals__.currentLevel = this.currentLevel;

      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!\nStarting Level ${this.currentLevel}...`);
      
      this.time.delayedCall(2000, () => {
        this.messageText.setText('');
        this.startLevel(this.currentLevel);
      });
    } else {
      this.victory();
    }
  }

  victory() {
    window.__signals__.victory = true;
    this.gameStarted = false;
    this.messageText.setText('VICTORY!\nAll 5 Levels Complete!\nScore: ' + this.score);
    this.physics.pause();
  }

  gameOver() {
    window.__signals__.gameOver = true;
    this.gameStarted = false;
    this.messageText.setText('GAME OVER\nScore: ' + this.score);
    this.physics.pause();
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.totalLevels}`);
    this.enemiesText.setText(`Enemies: ${this.enemies.countActive(true)}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000033',
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