// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 场景状态标识
    this.sceneActive = true;
    
    // 添加标题
    const title = this.add.text(400, 150, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建开始按钮背景（灰色矩形）
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = 400;
    const buttonY = 300;

    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);

    // 添加按钮文字
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight);
    buttonZone.setInteractive({ useHandCursor: true });

    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      graphics.clear();
      graphics.fillStyle(0xa0a0a0, 1); // 浅灰色
      graphics.fillRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);
    });

    buttonZone.on('pointerout', () => {
      graphics.clear();
      graphics.fillStyle(0x808080, 1); // 恢复灰色
      graphics.fillRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);
    });

    // 点击事件 - 切换到游戏场景
    buttonZone.on('pointerdown', () => {
      this.sceneActive = false;
      this.scene.start('GameScene');
    });

    // 添加提示文字
    const hint = this.add.text(400, 450, '点击按钮开始游戏', {
      fontSize: '16px',
      color: '#cccccc'
    });
    hint.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 可验证的游戏状态
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameTime = 0;
    this.isPlaying = true;

    // 背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示场景标题
    const title = this.add.text(400, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示游戏状态信息
    this.scoreText = this.add.text(100, 150, `分数: ${this.score}`, {
      fontSize: '24px',
      color: '#00ff00'
    });

    this.levelText = this.add.text(100, 190, `等级: ${this.level}`, {
      fontSize: '24px',
      color: '#00ffff'
    });

    this.healthText = this.add.text(100, 230, `生命值: ${this.health}`, {
      fontSize: '24px',
      color: '#ff0000'
    });

    this.timeText = this.add.text(100, 270, `游戏时间: ${this.gameTime.toFixed(1)}s`, {
      fontSize: '24px',
      color: '#ffff00'
    });

    // 创建一个简单的玩家方块
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(375, 375, 50, 50);

    // 添加返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = 400;
    const backButtonY = 500;

    const backGraphics = this.add.graphics();
    backGraphics.fillStyle(0x606060, 1);
    backGraphics.fillRect(backButtonX - backButtonWidth / 2, backButtonY - backButtonHeight / 2, backButtonWidth, backButtonHeight);

    const backText = this.add.text(backButtonX, backButtonY, '返回菜单', {
      fontSize: '20px',
      color: '#ffffff'
    });
    backText.setOrigin(0.5);

    const backZone = this.add.zone(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
    backZone.setInteractive({ useHandCursor: true });

    backZone.on('pointerover', () => {
      backGraphics.clear();
      backGraphics.fillStyle(0x808080, 1);
      backGraphics.fillRect(backButtonX - backButtonWidth / 2, backButtonY - backButtonHeight / 2, backButtonWidth, backButtonHeight);
    });

    backZone.on('pointerout', () => {
      backGraphics.clear();
      backGraphics.fillStyle(0x606060, 1);
      backGraphics.fillRect(backButtonX - backButtonWidth / 2, backButtonY - backButtonHeight / 2, backButtonWidth, backButtonHeight);
    });

    backZone.on('pointerdown', () => {
      this.isPlaying = false;
      this.scene.start('MenuScene');
    });

    // 添加状态说明
    const statusInfo = this.add.text(400, 350, '游戏状态实时更新中...', {
      fontSize: '16px',
      color: '#aaaaaa'
    });
    statusInfo.setOrigin(0.5);
  }

  update(time, delta) {
    if (!this.isPlaying) return;

    // 更新游戏时间
    this.gameTime += delta / 1000;
    this.timeText.setText(`游戏时间: ${this.gameTime.toFixed(1)}s`);

    // 模拟分数增长（每秒增加10分）
    this.score += Math.floor(delta / 100);
    this.scoreText.setText(`分数: ${this.score}`);

    // 每1000分升一级
    const newLevel = Math.floor(this.score / 1000) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
      this.levelText.setText(`等级: ${this.level}`);
    }

    // 模拟生命值变化（缓慢减少）
    this.health = Math.max(0, this.health - delta / 1000);
    this.healthText.setText(`生命值: ${Math.floor(this.health)}`);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d44',
  scene: [MenuScene, GameScene] // MenuScene 为默认启动场景
};

// 创建游戏实例
new Phaser.Game(config);